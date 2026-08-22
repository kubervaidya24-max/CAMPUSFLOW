import mongoose from 'mongoose';

export const JOB_STATUSES = ['APPLIED', 'OA', 'TECHNICAL', 'HR', 'OFFER', 'REJECTED'];

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    role: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    linkedin: { type: String, trim: true },
  },
  { _id: false }
);

const jobApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    role: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
      maxlength: [100, 'Role cannot exceed 100 characters'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Internship', 'Contract'],
      default: 'Full-time',
    },
    salary: {
      type: String,
      trim: true,
      maxlength: [50, 'Salary cannot exceed 50 characters'],
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: JOB_STATUSES,
      default: 'APPLIED',
      index: true,
    },
    interviewDate: {
      type: Date,
    },
    jobUrl: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [3000, 'Notes cannot exceed 3000 characters'],
    },
    contacts: [contactSchema],
  },
  {
    timestamps: true,
  }
);

// Compound index for pipeline querying & sorting
jobApplicationSchema.index({ user: 1, status: 1, applicationDate: -1 });

export const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
export default JobApplication;
