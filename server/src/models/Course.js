import mongoose from 'mongoose';

const syllabusItemSchema = new mongoose.Schema(
  {
    week: {
      type: Number,
      required: [true, 'Week number is required'],
      min: 1,
      max: 52,
    },
    title: {
      type: String,
      required: [true, 'Syllabus topic title is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
  },
  { _id: false }
);

const enrolledStudentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      minlength: [3, 'Course title must be at least 3 characters'],
      maxlength: [120, 'Course title cannot exceed 120 characters'],
    },
    code: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9_-]{2,15}$/, 'Course code must be alphanumeric (2-15 chars, e.g. CS101, SE-302)'],
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      trim: true,
      maxlength: [2000, 'Course description cannot exceed 2000 characters'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be between 1 and 12'],
      max: [12, 'Semester must be between 1 and 12'],
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: [1, 'Credits must be at least 1'],
      max: [10, 'Credits cannot exceed 10'],
      default: 3,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Faculty instructor is required'],
    },
    enrolledStudents: {
      type: [enrolledStudentSchema],
      default: [],
    },
    capacity: {
      type: Number,
      required: [true, 'Course capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [500, 'Capacity cannot exceed 500'],
      default: 60,
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published', 'archived'],
        message: '{VALUE} is not a valid course status',
      },
      default: 'draft',
      index: true,
    },
    syllabus: {
      type: [syllabusItemSchema],
      default: [],
    },
    schedule: {
      days: {
        type: [String],
        default: [],
      },
      time: {
        type: String,
        trim: true,
        default: '',
      },
      room: {
        type: String,
        trim: true,
        default: '',
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.enrolledCount = ret.enrolledStudents ? ret.enrolledStudents.length : 0;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound Indexes for fast querying
courseSchema.index({ department: 1, semester: 1, status: 1 });
courseSchema.index({ 'enrolledStudents.student': 1 });
courseSchema.index({ title: 'text', description: 'text', code: 'text' });

// Virtual enrolledCount
courseSchema.virtual('enrolledCount').get(function () {
  return this.enrolledStudents ? this.enrolledStudents.length : 0;
});

export const Course = mongoose.model('Course', courseSchema);
export default Course;
