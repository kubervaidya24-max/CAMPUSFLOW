import mongoose from 'mongoose';

export const PROGRESS_STATUSES = ['NOT_STARTED', 'ATTEMPTED', 'SOLVED'];

const dsaSheetProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    sheet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DSASheet',
      required: [true, 'Sheet reference is required'],
      index: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Question ID reference is required'],
      index: true,
    },
    status: {
      type: String,
      enum: PROGRESS_STATUSES,
      required: [true, 'Progress status is required'],
      default: 'NOT_STARTED',
      index: true,
    },
    attemptedAt: {
      type: Date,
    },
    solvedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Guarantee exactly ONE progress record per user per question in a sheet
dsaSheetProgressSchema.index({ user: 1, sheet: 1, questionId: 1 }, { unique: true });

// Accelerated query index for user sheet statistics
dsaSheetProgressSchema.index({ user: 1, sheet: 1, status: 1 });

export const DSASheetProgress = mongoose.model('DSASheetProgress', dsaSheetProgressSchema);
export default DSASheetProgress;
