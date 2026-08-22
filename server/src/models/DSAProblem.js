import mongoose from 'mongoose';

export const DSA_TOPICS = [
  'Arrays',
  'Strings',
  'Linked Lists',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Recursion & Backtracking',
  'Stack & Queue',
  'Binary Search',
  'Heaps & HashMaps',
  'Greedy',
  'Trie',
  'Bit Manipulation',
  'Other',
];

export const DSA_PLATFORMS = [
  'LeetCode',
  'Codeforces',
  'GeeksforGeeks',
  'HackerRank',
  'InterviewBit',
  'CodeChef',
  'NeetCode',
  'Other',
];

const dsaProblemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    platform: {
      type: String,
      enum: DSA_PLATFORMS,
      default: 'LeetCode',
    },
    problemUrl: {
      type: String,
      trim: true,
    },
    topic: {
      type: String,
      enum: DSA_TOPICS,
      required: [true, 'Topic is required'],
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: [true, 'Difficulty is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['Todo', 'In Progress', 'Solved', 'Revisit'],
      default: 'Todo',
      index: true,
    },
    solvedDate: {
      type: Date,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
    },
    timeSpentMinutes: {
      type: Number,
      min: [0, 'Time spent cannot be negative'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast user analytics & filtered problem queries
dsaProblemSchema.index({ user: 1, status: 1, topic: 1 });
dsaProblemSchema.index({ user: 1, solvedDate: -1 });

export const DSAProblem = mongoose.model('DSAProblem', dsaProblemSchema);
export default DSAProblem;
