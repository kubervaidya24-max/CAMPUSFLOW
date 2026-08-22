import mongoose from 'mongoose';

const submissionAttachmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Attachment name is required'],
      trim: true,
      maxlength: 150,
    },
    url: {
      type: String,
      required: [true, 'Attachment URL is required'],
      trim: true,
    },
    size: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: [true, 'Assignment reference is required'],
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student submitter reference is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Submission notes or project repository URL is required'],
      trim: true,
      maxlength: [3000, 'Submission notes cannot exceed 3000 characters'],
    },
    attachments: {
      type: [submissionAttachmentSchema],
      default: [],
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['submitted', 'late', 'graded'],
        message: '{VALUE} is not a valid submission status',
      },
      default: 'submitted',
      index: true,
    },
    grade: {
      score: {
        type: Number,
        min: [0, 'Score cannot be negative'],
      },
      feedback: {
        type: String,
        trim: true,
        maxlength: [1500, 'Feedback cannot exceed 1500 characters'],
        default: '',
      },
      gradedAt: {
        type: Date,
      },
      gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
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

// Compound Unique Index: One submission record per student per assignment
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
submissionSchema.index({ course: 1, student: 1 });

export const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
