import { io } from 'socket.io-client';

let socketInstance = null;
let currentToken = null;

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
  : 'http://localhost:5000';

export const socketService = {
  /**
   * Get or create authenticated Socket.IO client instance
   * @param {string} token - JWT Access Token
   * @returns {import('socket.io-client').Socket}
   */
  getSocket: (token) => {
    if (!token) {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
      return null;
    }

    // Reuse existing connection if token is identical and socket is active
    if (socketInstance && currentToken === token && socketInstance.connected) {
      return socketInstance;
    }

    if (socketInstance) {
      socketInstance.disconnect();
    }

    currentToken = token;

    socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    return socketInstance;
  },

  /**
   * Disconnect active socket instance
   */
  disconnect: () => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
      currentToken = null;
    }
  },
};

export default socketService;
