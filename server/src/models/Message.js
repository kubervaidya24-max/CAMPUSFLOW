import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required for messages'],
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Message sender is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Message content cannot be empty'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    attachments: [
      {
        name: { type: String, trim: true },
        url: { type: String, trim: true },
        type: { type: String, trim: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound Index for high-speed chronological chat history queries within a project
messageSchema.index({ project: 1, createdAt: 1 });

export const Message = mongoose.model('Message', messageSchema);
export default Message;
