import mongoose from 'mongoose';

const projectActivitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    action: {
      type: String,
      enum: {
        values: [
          'PROJECT_CREATED',
          'MEMBER_JOINED',
          'MEMBER_REMOVED',
          'MEMBER_LEFT',
          'INVITATION_SENT',
          'TASK_CREATED',
          'TASK_ASSIGNED',
          'TASK_MOVED',
          'TASK_COMPLETED',
          'TASK_DELETED',
        ],
        message: '{VALUE} is not a valid activity action',
      },
      required: [true, 'Activity action is required'],
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound Index for chronological project timeline queries
projectActivitySchema.index({ project: 1, createdAt: -1 });

export const ProjectActivity = mongoose.model('ProjectActivity', projectActivitySchema);
export default ProjectActivity;
