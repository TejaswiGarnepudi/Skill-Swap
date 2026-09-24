import express from 'express';
import { getMyProgress, createOrUpdateProgress, toggleTopic } from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMyProgress)
  .post(createOrUpdateProgress);

router.put('/:id/topics/:topicIndex', toggleTopic);

export default router;
