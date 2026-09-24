import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import env from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initializeSocket } from './socket/index.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import matchingRoutes from './routes/matching.js';
import exchangeRoutes from './routes/exchanges.js';
import groupRoutes from './routes/groups.js';
import sessionRoutes from './routes/sessions.js';
import ratingRoutes from './routes/ratings.js';
import progressRoutes from './routes/progress.js';
import notificationRoutes from './routes/notifications.js';

const app = express();
const server = http.createServer(app);

// Permissive CORS for local and production Vercel frontend
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, '');
    const cleanClientUrl = (env.clientUrl || '').replace(/\/+$/, '');

    // Allow configured client URL, localhost, 127.0.0.1, or any vercel.app deployment
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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Root Health Check Route
app.get('/', (req, res) => {
  res.json({
    message: 'SkillSwap Backend API is live and healthy! 🚀',
    status: 'online',
    timestamp: new Date()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

initializeSocket(server);

connectDB().then(() => {
  server.listen(env.port, () => {
    console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
  });
});
