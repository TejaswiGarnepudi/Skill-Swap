import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import GroupMessage from '../models/GroupMessage.js';
import User from '../models/User.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.replace(/\/+$/, '');
        const cleanClientUrl = (env.clientUrl || '').replace(/\/+$/, '');
        if (
          cleanOrigin === cleanClientUrl ||
          cleanOrigin.endsWith('.vercel.app') ||
          cleanOrigin.includes('localhost') ||
          cleanOrigin.includes('127.0.0.1') ||
          cleanOrigin === 'https://skill-swap-ashen-two.vercel.app'
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token || token === 'null' || token === 'undefined') {
      return next(new Error('Authentication error: No token provided'));
    }
    try {
      const decoded = jwt.verify(token, env.jwtSecret);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    socket.join(`user:${userId}`);

    socket.on('join-group', (groupId) => {
      socket.join(`group:${groupId}`);
    });

    socket.on('leave-group', (groupId) => {
      socket.leave(`group:${groupId}`);
    });

    socket.on('group-message', async (data) => {
      try {
        const { groupId, content, type, replyTo } = data;
        const msg = await GroupMessage.create({
          group: groupId,
          sender: userId,
          content,
          type: type || 'message',
          replyTo: replyTo || null
        });

        const populatedMsg = await GroupMessage.findById(msg._id).populate('sender', 'name avatar');
        
        io.to(`group:${groupId}`).emit('new-message', populatedMsg);
      } catch (err) {
        console.error('Error saving group message:', err.message);
      }
    });

    socket.on('typing', (groupId) => {
      socket.to(`group:${groupId}`).emit('user-typing', { userId });
    });

    socket.on('stop-typing', (groupId) => {
      socket.to(`group:${groupId}`).emit('user-stop-typing', { userId });
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
