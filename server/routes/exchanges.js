import express from 'express';
import { sendRequest, getMyRequests, updateRequestStatus } from '../controllers/exchangeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', sendRequest);
router.get('/', getMyRequests);
router.put('/:id', updateRequestStatus);

export default router;
