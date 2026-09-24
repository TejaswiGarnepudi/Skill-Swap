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

app.use(cors({
  origin: env.clientUrl,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

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
