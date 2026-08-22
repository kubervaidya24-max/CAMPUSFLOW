import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Message } from '../models/Message.js';
import { config } from '../config/env.js';

let ioInstance = null;

// Track active members in project rooms: Map<projectId, Set<userId>>
const roomPresence = new Map();

/**
 * Initialize and attach Socket.IO server to HTTP server
 * @param {import('http').Server} httpServer
 * @returns {Server}
 */
export const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth?.token;

      if (!token && socket.handshake.headers?.authorization) {
        const parts = socket.handshake.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
          token = parts[1];
        }
      }

      if (!token) {
        return next(new Error('Authentication error: Missing token'));
      }

      let decoded;
      try {
        decoded = jwt.verify(token, config.jwtSecret);
      } catch {
        return next(new Error('Authentication error: Invalid or expired token'));
      }

      const user = await User.findById(decoded.id).select('name email role profile');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      socket.userId = user._id.toString();
      next();
    } catch {
      next(new Error('Authentication error: Internal validation failure'));
    }
  });

  // Connection Handler
  io.on('connection', (socket) => {
    // Automatically join the user's private notification room
    socket.join(`user:${socket.userId}`);

    // 1. Join Project Room with strict authorization check
    socket.on('join_project', async (data, callback) => {
      try {
        const projectId = typeof data === 'string' ? data : data?.projectId;

        if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
          const errPayload = { message: 'Invalid project ID format', code: 400 };
          socket.emit('room_error', errPayload);
          if (typeof callback === 'function') callback({ success: false, ...errPayload });
          return;
        }

        const project = await Project.findById(projectId);
        if (!project) {
          const errPayload = { message: 'Project not found', code: 404 };
          socket.emit('room_error', errPayload);
          if (typeof callback === 'function') callback({ success: false, ...errPayload });
          return;
        }

        // Verify user is an active member or admin
        const isMember = project.members.some((m) => m.user.equals(socket.user._id));
        if (socket.user.role !== 'admin' && !isMember) {
          const errPayload = {
            message: 'Forbidden: You are not an authorized member of this project',
            code: 403,
            projectId,
          };
          socket.emit('room_error', errPayload);
          if (typeof callback === 'function') callback({ success: false, ...errPayload });
          return;
        }

        const roomName = `project:${projectId}`;
        socket.join(roomName);

        // Update Presence
        if (!roomPresence.has(projectId)) {
          roomPresence.set(projectId, new Set());
        }
        roomPresence.get(projectId).add(socket.userId);

        const onlineUserIds = Array.from(roomPresence.get(projectId));

        // Notify caller of success
        socket.emit('room_joined', { projectId, room: roomName, onlineUsers: onlineUserIds });
        // Broadcast presence update to room
        io.to(roomName).emit('presence_update', { projectId, onlineUsers: onlineUserIds });

        if (typeof callback === 'function') {
          callback({ success: true, projectId, onlineUsers: onlineUserIds });
        }
      } catch (error) {
        socket.emit('room_error', { message: error.message || 'Failed to join project room', code: 500 });
      }
    });

    // 2. Leave Project Room
    socket.on('leave_project', (data) => {
      const projectId = typeof data === 'string' ? data : data?.projectId;
      if (projectId) {
        const roomName = `project:${projectId}`;
        socket.leave(roomName);

        if (roomPresence.has(projectId)) {
          roomPresence.get(projectId).delete(socket.userId);
          const onlineUserIds = Array.from(roomPresence.get(projectId));
          io.to(roomName).emit('presence_update', { projectId, onlineUsers: onlineUserIds });
        }
      }
    });

    // 3. Send Message with MongoDB Persistence & Room Broadcast
    socket.on('send_message', async (data, callback) => {
      try {
        const { projectId, content, attachments } = data || {};

        if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
          const errPayload = { message: 'Invalid project ID', code: 400 };
          socket.emit('message_error', errPayload);
          if (typeof callback === 'function') callback({ success: false, ...errPayload });
          return;
        }

        if (!content || !content.trim()) {
          const errPayload = { message: 'Message content cannot be empty', code: 400 };
          socket.emit('message_error', errPayload);
          if (typeof callback === 'function') callback({ success: false, ...errPayload });
          return;
        }

        const project = await Project.findById(projectId);
        if (!project) {
          const errPayload = { message: 'Project not found', code: 404 };
          socket.emit('message_error', errPayload);
          if (typeof callback === 'function') callback({ success: false, ...errPayload });
          return;
        }

        const isMember = project.members.some((m) => m.user.equals(socket.user._id));
        if (socket.user.role !== 'admin' && !isMember) {
          const errPayload = { message: 'Forbidden: You cannot send messages in this project', code: 403 };
          socket.emit('message_error', errPayload);
          if (typeof callback === 'function') callback({ success: false, ...errPayload });
          return;
        }

        // Persist message to MongoDB
        const newMessage = await Message.create({
          project: projectId,
          sender: socket.user._id,
          content: content.trim(),
          attachments: Array.isArray(attachments) ? attachments : [],
        });

        const populated = await Message.findById(newMessage._id).populate(
          'sender',
          'name email role profile.avatar'
        );

        const roomName = `project:${projectId}`;

        // Broadcast to all sockets in the project room
        io.to(roomName).emit('new_message', {
          projectId,
          message: populated,
        });

        if (typeof callback === 'function') {
          callback({ success: true, message: populated });
        }
      } catch (error) {
        socket.emit('message_error', { message: error.message || 'Failed to send message', code: 500 });
        if (typeof callback === 'function') {
          callback({ success: false, message: error.message });
        }
      }
    });

    // 4. Real-time Typing Indicators
    socket.on('typing_start', (data) => {
      const projectId = typeof data === 'string' ? data : data?.projectId;
      if (projectId) {
        socket.to(`project:${projectId}`).emit('user_typing', {
          projectId,
          user: {
            _id: socket.user._id,
            name: socket.user.name,
          },
        });
      }
    });

    socket.on('typing_stop', (data) => {
      const projectId = typeof data === 'string' ? data : data?.projectId;
      if (projectId) {
        socket.to(`project:${projectId}`).emit('user_stopped_typing', {
          projectId,
          userId: socket.user._id,
        });
      }
    });

    // 5. Disconnect Cleanup
    socket.on('disconnect', () => {
      // Remove user from all room presences
      for (const [projectId, userSet] of roomPresence.entries()) {
        if (userSet.has(socket.userId)) {
          userSet.delete(socket.userId);
          const onlineUserIds = Array.from(userSet);
          io.to(`project:${projectId}`).emit('presence_update', {
            projectId,
            onlineUsers: onlineUserIds,
          });
        }
      }
    });
  });

  ioInstance = io;
  return io;
};

/**
 * Get active Socket.IO instance
 * @returns {Server}
 */
export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.IO server has not been initialized yet');
  }
  return ioInstance;
};
