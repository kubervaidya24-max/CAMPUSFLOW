import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [2, 'Task title must be at least 2 characters'],
      maxlength: [150, 'Task title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task creator is required'],
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: '{VALUE} is not a valid task priority',
      },
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['TODO', 'IN_PROGRESS', 'DONE'],
        message: '{VALUE} is not a valid task status',
      },
      default: 'TODO',
      index: true,
    },
    deadline: {
      type: Date,
    },
    order: {
      type: Number,
      default: 0,
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

// Compound Index for fast Kanban column fetching
taskSchema.index({ project: 1, status: 1, order: 1 });

export const Task = mongoose.model('Task', taskSchema);
export default Task;
