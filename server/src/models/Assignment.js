import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
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

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Assignment description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Faculty creator reference is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date / deadline is required'],
      index: true,
    },
    totalPoints: {
      type: Number,
      required: [true, 'Total points / max marks is required'],
      min: [1, 'Total points must be at least 1'],
      max: [1000, 'Total points cannot exceed 1000'],
      default: 100,
    },
    allowLate: {
      type: Boolean,
      default: true,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published', 'closed'],
        message: '{VALUE} is not a supported assignment status',
      },
      default: 'published',
      index: true,
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

// Compound Index for fast lookups
assignmentSchema.index({ course: 1, dueDate: 1 });
assignmentSchema.index({ faculty: 1 });

export const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
