import express from 'express';
import { createRating, getUserRatings } from '../controllers/ratingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createRating);
router.get('/:userId', getUserRatings);

export default router;
