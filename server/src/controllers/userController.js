import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * Get current authenticated user's profile
 * @route GET /api/users/me
 */
export const getMyProfile = async (req, res) => {
  return sendSuccess(res, 'User profile retrieved successfully', {
    user: req.user.toJSON(),
  });
};

/**
 * Update current authenticated user's profile (with strict field whitelisting)
 * @route PATCH /api/users/me
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const { name, profile } = req.body;

    // 1. Update root permitted fields
    if (name !== undefined) {
      user.name = name;
    }

    // 2. Update profile subdocument permitted fields
    if (profile && typeof profile === 'object') {
      const allowedProfileFields = [
        'avatar',
        'bio',
        'department',
        'semester',
        'graduationYear',
        'collegeId',
        'skills',
        'interests',
        'designation',
        'subjects',
        'officeLocation',
      ];

      allowedProfileFields.forEach((field) => {
        if (profile[field] !== undefined) {
          user.profile[field] = profile[field];
        }
      });

      // Handle nested socialLinks
      if (profile.socialLinks && typeof profile.socialLinks === 'object') {
        user.profile.socialLinks = {
          ...user.profile.socialLinks?.toObject?.(),
          ...profile.socialLinks,
        };
      }
    }

    await user.save();

    return sendSuccess(res, 'Profile updated successfully', {
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get public profile of a user by ID
 * @route GET /api/users/:id
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid user ID format'));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    return sendSuccess(res, 'User profile retrieved successfully', {
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};
