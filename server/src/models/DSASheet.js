import mongoose from 'mongoose';
import { DSA_TOPICS, DSA_PLATFORMS } from './DSAProblem.js';

const dsaSheetQuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Question title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    problemUrl: {
      type: String,
      required: [true, 'Problem URL is required'],
      trim: true,
    },
    platform: {
      type: String,
      enum: DSA_PLATFORMS,
      default: 'LeetCode',
    },
    topic: {
      type: String,
      enum: DSA_TOPICS,
      required: [true, 'Topic is required'],
    },
    subTopic: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'Subtopic cannot exceed 100 characters'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: [true, 'Difficulty is required'],
      default: 'Medium',
    },
    tags: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: true,
    timestamps: true,
  }
);

const dsaSheetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Sheet title is required'],
      trim: true,
      default: 'Must-to-Do DSA Core Sheet',
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: 'Curated collection of essential coding interview questions across fundamental data structures and algorithmic paradigms.',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      default: 'must-to-do',
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    questions: {
      type: [dsaSheetQuestionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Virtual for totalQuestions
dsaSheetSchema.virtual('totalQuestions').get(function () {
  return Array.isArray(this.questions) ? this.questions.length : 0;
});

export const DSASheet = mongoose.model('DSASheet', dsaSheetSchema);
export default DSASheet;
