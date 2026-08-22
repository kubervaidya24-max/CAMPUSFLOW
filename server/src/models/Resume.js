import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, required: true, trim: true },
    degree: { type: String, required: true, trim: true },
    fieldOfStudy: { type: String, trim: true },
    startDate: { type: String, trim: true },
    endDate: { type: String, trim: true },
    current: { type: Boolean, default: false },
    grade: { type: String, trim: true },
    location: { type: String, trim: true },
  },
  { _id: false }
);

const projectItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    technologies: [{ type: String, trim: true }],
    repositoryUrl: { type: String, trim: true },
    liveUrl: { type: String, trim: true },
    description: { type: String, trim: true },
    highlights: [{ type: String, trim: true }],
  },
  { _id: false }
);

const experienceItemSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    startDate: { type: String, trim: true },
    endDate: { type: String, trim: true },
    current: { type: Boolean, default: false },
    description: { type: String, trim: true },
    highlights: [{ type: String, trim: true }],
  },
  { _id: false }
);

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    issuer: { type: String, required: true, trim: true },
    issueDate: { type: String, trim: true },
    credentialUrl: { type: String, trim: true },
  },
  { _id: false }
);

const achievementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    date: { type: String, trim: true },
  },
  { _id: false }
);

const skillCategorySchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    items: [{ type: String, trim: true }],
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Resume title is required'],
      trim: true,
      default: 'Software Engineering Resume',
    },
    template: {
      type: String,
      enum: ['modern', 'dual-column'],
      default: 'modern',
    },
    personalInfo: {
      fullName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      headline: { type: String, default: '' },
      summary: { type: String, default: '' },
    },
    education: [educationSchema],
    skills: [skillCategorySchema],
    projects: [projectItemSchema],
    experience: [experienceItemSchema],
    certifications: [certificationSchema],
    achievements: [achievementSchema],
    links: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      portfolio: { type: String, default: '' },
      leetcode: { type: String, default: '' },
      other: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick user resume retrieval
resumeSchema.index({ user: 1, createdAt: -1 });

export const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
