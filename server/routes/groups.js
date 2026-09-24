import express from 'express';
import {
  createGroup,
  getGroups,
  getGroupById,
  requestToJoinGroup,
  getGroupRequests,
  getMyGroupRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  leaveGroup,
  updateGroup,
  deleteGroup,
  addGroupGoal,
  deleteGroupGoal,
  addRoadmapItem,
  toggleRoadmapItem,
  addResource,
  addTask,
  toggleTask,
  getGroupMessages
} from '../controllers/groupController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getGroups);
router.post('/', createGroup);
router.get('/my-requests', getMyGroupRequests);
router.get('/:id', getGroupById);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);
router.post('/:id/join-request', requestToJoinGroup);
router.post('/:id/leave', leaveGroup);
router.get('/:id/requests', getGroupRequests);
router.put('/requests/:requestId/accept', acceptJoinRequest);
router.put('/requests/:requestId/reject', rejectJoinRequest);

router.post('/:id/goals', addGroupGoal);
router.delete('/:id/goals/:goalIndex', deleteGroupGoal);

router.post('/:id/roadmap', addRoadmapItem);
router.put('/:id/roadmap/:itemIndex', toggleRoadmapItem);
router.post('/:id/resources', addResource);
router.post('/:id/tasks', addTask);
router.put('/:id/tasks/:taskIndex', toggleTask);
router.get('/:id/messages', getGroupMessages);

export default router;
