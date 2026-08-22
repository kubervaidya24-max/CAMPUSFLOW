import mongoose from 'mongoose';
import { Resume } from '../models/Resume.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * Get all resumes for authenticated user
 * @route GET /api/resumes
 */
export const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ updatedAt: -1 });
    return sendSuccess(res, 'Resumes retrieved successfully', { resumes });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single resume by ID
 * @route GET /api/resumes/:id
 */
export const getResumeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid resume ID format'));
    }

    const resume = await Resume.findOne({ _id: id, user: req.user._id });
    if (!resume) {
      return next(ApiError.notFound('Resume not found or unauthorized'));
    }

    return sendSuccess(res, 'Resume retrieved successfully', { resume });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new resume
 * @route POST /api/resumes
 */
export const createResume = async (req, res, next) => {
  try {
    const resumeData = {
      ...req.body,
      user: req.user._id,
    };

    const resume = await Resume.create(resumeData);
    return sendSuccess(res, 'Resume created successfully', { resume }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update existing resume
 * @route PATCH /api/resumes/:id
 */
export const updateResume = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid resume ID format'));
    }

    const resume = await Resume.findOne({ _id: id, user: req.user._id });
    if (!resume) {
      return next(ApiError.notFound('Resume not found or unauthorized'));
    }

    Object.assign(resume, req.body);
    await resume.save();

    return sendSuccess(res, 'Resume updated successfully', { resume });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete resume
 * @route DELETE /api/resumes/:id
 */
export const deleteResume = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid resume ID format'));
    }

    const resume = await Resume.findOneAndDelete({ _id: id, user: req.user._id });
    if (!resume) {
      return next(ApiError.notFound('Resume not found or unauthorized'));
    }

    return sendSuccess(res, 'Resume deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Auto-fill draft resume from user profile & project records
 * @route GET /api/resumes/auto-fill
 */
export const autoFillResume = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [user, projects] = await Promise.all([
      User.findById(userId),
      Project.find({
        $or: [{ owner: userId }, { 'members.user': userId }],
      }).limit(5),
    ]);

    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    const profile = user.profile || {};

    const draft = {
      title: `${user.name.split(' ')[0]}'s Tech Resume`,
      template: 'modern',
      personalInfo: {
        fullName: user.name,
        email: user.email,
        phone: '+1 (555) 234-5678',
        location: profile.department ? `${profile.department}, Campus` : 'San Francisco, CA',
        headline:
          user.role === 'student'
            ? 'Software Engineering & Distributed Systems Student'
            : 'Faculty Member & Senior Researcher',
        summary:
          profile.bio ||
          'Motivated software engineering student with proven project collaboration experience, algorithmic problem-solving skills, and a passion for modern full-stack development.',
      },
      education: [
        {
          institution: 'State University Institute of Technology',
          degree: 'Bachelor of Technology in Computer Science',
          fieldOfStudy: profile.department || 'Computer Science & Engineering',
          startDate: '2023',
          endDate: '2027',
          current: true,
          grade: 'CGPA: 8.9 / 10.0',
          location: 'Main Campus',
        },
      ],
      skills: [
        {
          category: 'Languages & Core Frameworks',
          items:
            profile.skills && profile.skills.length > 0
              ? profile.skills
              : ['JavaScript (ES6+)', 'TypeScript', 'Python', 'C++', 'React', 'Node.js', 'Express'],
        },
        {
          category: 'Databases & Cloud Architecture',
          items: ['MongoDB', 'PostgreSQL', 'Redis', 'Docker', 'RESTful APIs', 'Socket.IO'],
        },
        {
          category: 'Developer Tools',
          items: ['Git / GitHub', 'Linux / Bash', 'Vite', 'Postman', 'Vitest'],
        },
      ],
      projects: projects.map((p) => ({
        title: p.title,
        role: p.owner.equals(userId) ? 'Project Lead & Lead Engineer' : 'Full Stack Contributor',
        technologies: p.technologies && p.technologies.length > 0 ? p.technologies : ['MERN Stack', 'TailwindCSS'],
        repositoryUrl: p.repositoryUrl || '',
        liveUrl: p.liveUrl || '',
        description: p.description || 'Full-cycle collaborative web application with real-time socket sync.',
        highlights: [
          'Engineered scalable REST endpoints and relational MongoDB data models with compound indexes.',
          'Integrated responsive UI components with real-time state synchronization.',
        ],
      })),
      experience: [
        {
          company: 'CampusFlow Engineering Team',
          role: 'Full Stack Engineering Intern',
          location: 'On-Campus / Remote',
          startDate: 'Jun 2025',
          endDate: 'Present',
          current: true,
          description: 'Developing high-performance collaborative features and real-time communication modules.',
          highlights: [
            'Built real-time messaging pipeline utilizing Socket.IO and Mongoose persistence.',
            'Optimized MongoDB query performance utilizing compound indexes, reducing latency by 40%.',
          ],
        },
      ],
      certifications: [
        {
          name: 'AWS Certified Cloud Practitioner',
          issuer: 'Amazon Web Services',
          issueDate: '2025',
          credentialUrl: 'https://aws.amazon.com/verification',
        },
      ],
      achievements: [
        {
          title: 'Top 5% Algorithm Challenge Winner',
          description: 'Solved over 150+ DSA problems across Arrays, DP, and Graph algorithms.',
          date: '2026',
        },
      ],
      links: {
        github: profile.socialLinks?.github || profile.github || 'https://github.com',
        linkedin: profile.socialLinks?.linkedin || profile.linkedin || 'https://linkedin.com',
        portfolio: profile.socialLinks?.portfolio || profile.portfolio || '',
        leetcode: 'https://leetcode.com',
        other: '',
      },
    };

    return sendSuccess(res, 'Auto-filled resume draft generated successfully', { draft });
  } catch (error) {
    next(error);
  }
};
