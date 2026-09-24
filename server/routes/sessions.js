import express from 'express';
import {
  createSession, getMySessions, getUpcomingSessions, getGroupSessions, joinSession, leaveSession, completeSession
} from '../controllers/sessionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createSession)
  .get(getMySessions);

router.get('/upcoming', getUpcomingSessions);
router.get('/group/:groupId', getGroupSessions);

router.post('/:id/join', joinSession);
router.post('/:id/leave', leaveSession);
router.put('/:id/complete', completeSession);

export default router;
