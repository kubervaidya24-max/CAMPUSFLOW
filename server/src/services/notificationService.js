import { Notification } from '../models/Notification.js';
import { getIO } from '../socket/socketServer.js';

export const notificationService = {
  /**
   * Create and deliver a single notification
   * @param {Object} data - { recipient, type, title, message, relatedResource }
   * @returns {Promise<import('../models/Notification.js').Notification>}
   */
  createNotification: async ({ recipient, type, title, message, relatedResource }) => {
    try {
      if (!recipient || !type || !title || !message) {
        return null;
      }

      const notification = await Notification.create({
        recipient,
        type,
        title,
        message,
        relatedResource: relatedResource || {},
      });

      // Deliver via Socket.IO if active
      try {
        const io = getIO();
        if (io) {
          const recipientId = recipient.toString();
          io.to(`user:${recipientId}`).emit('new_notification', {
            notification,
          });
        }
      } catch {
        // Socket.IO may not be initialized in some test environments
      }

      return notification;
    } catch (error) {
      console.error('[NotificationService] Error creating notification:', error.message);
      return null;
    }
  },

  /**
   * Create and deliver bulk notifications to multiple recipients
   * @param {Array<string|ObjectId>} recipients - Array of user IDs
   * @param {Object} data - { type, title, message, relatedResource }
   * @returns {Promise<Array>}
   */
  createBulkNotifications: async (recipients, { type, title, message, relatedResource }) => {
    try {
      if (!Array.isArray(recipients) || recipients.length === 0) {
        return [];
      }

      const docs = recipients.map((recipientId) => ({
        recipient: recipientId,
        type,
        title,
        message,
        relatedResource: relatedResource || {},
      }));

      const createdList = await Notification.insertMany(docs);

      // Deliver real-time notifications to each recipient's personal room
      try {
        const io = getIO();
        if (io) {
          createdList.forEach((notif) => {
            io.to(`user:${notif.recipient.toString()}`).emit('new_notification', {
              notification: notif,
            });
          });
        }
      } catch {
        // Socket.IO may not be active in isolated test environments
      }

      return createdList;
    } catch (error) {
      console.error('[NotificationService] Error in bulk notifications:', error.message);
      return [];
    }
  },
};

export default notificationService;
