import crypto from 'crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Do not return password by default
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'faculty', 'admin'],
        message: '{VALUE} is not a supported role',
      },
      default: 'student',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    profile: {
      avatar: {
        type: String,
        default: '',
        trim: true,
      },
      bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
        default: '',
        trim: true,
      },
      department: {
        type: String,
        trim: true,
        default: '',
      },
      // Student-specific profile fields
      semester: {
        type: Number,
        min: [1, 'Semester must be between 1 and 12'],
        max: [12, 'Semester must be between 1 and 12'],
        default: 1,
      },
      graduationYear: {
        type: Number,
        min: [2000, 'Graduation year is invalid'],
        max: [2040, 'Graduation year is invalid'],
      },
      collegeId: {
        type: String,
        trim: true,
        default: '',
      },
      skills: {
        type: [String],
        default: [],
      },
      interests: {
        type: [String],
        default: [],
      },
      socialLinks: {
        github: {
          type: String,
          trim: true,
          default: '',
        },
        linkedin: {
          type: String,
          trim: true,
          default: '',
        },
        portfolio: {
          type: String,
          trim: true,
          default: '',
        },
      },
      // Faculty-specific profile fields
      designation: {
        type: String,
        trim: true,
        default: '',
      },
      subjects: {
        type: [String],
        default: [],
      },
      officeLocation: {
        type: String,
        trim: true,
        default: '',
      },
    },
    refreshTokens: [
      {
        token: {
          type: String,
          required: true,
        },
        expiresAt: {
          type: Date,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password instance method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    throw new Error('Password field was not selected in query');
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate short-lived Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
      name: this.name,
      jti: crypto.randomUUID(),
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn,
    }
  );
};

// Generate long-lived Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      jti: crypto.randomUUID(),
    },
    config.jwtRefreshSecret,
    {
      expiresIn: config.jwtRefreshExpiresIn,
    }
  );
};

export const User = mongoose.model('User', userSchema);
export default User;
