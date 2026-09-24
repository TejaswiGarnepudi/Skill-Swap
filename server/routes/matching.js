import express from 'express';
import { getMatches, getMatchDetail } from '../controllers/matchingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getMatches);
router.get('/:userId', getMatchDetail);

export default router;
