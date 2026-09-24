import express from 'express';
import { getUserProfile, updateProfile, updateSkills, searchUsers } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', searchUsers);
router.get('/search', searchUsers);
router.get('/:id', getUserProfile);
router.put('/profile', updateProfile);
router.put('/skills', updateSkills);

export default router;
