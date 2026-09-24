import Group from '../models/Group.js';
import User from '../models/User.js';
import GroupMessage from '../models/GroupMessage.js';
import GroupJoinRequest from '../models/GroupJoinRequest.js';
import Notification from '../models/Notification.js';

export const createGroup = async (req, res) => {
  try {
    const groupData = req.body;
    groupData.creator = req.user.id;
    groupData.members = [{ user: req.user.id, role: 'admin', joinedAt: new Date() }];
    
    const group = await Group.create(groupData);
    
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { groups: group._id } });
    
    const populated = await Group.findById(group._id)
      .populate('creator', 'name avatar bio skillsToTeach skillsToLearn')
      .populate('members.user', 'name avatar bio skillsToTeach skillsToLearn');
      
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroups = async (req, res) => {
  try {
    const { q, skill, difficulty, isActive } = req.query;
    const query = {};
    
    if (q && q.trim()) {
      query.$or = [
        { name: new RegExp(q.trim(), 'i') },
        { description: new RegExp(q.trim(), 'i') },
        { skill: new RegExp(q.trim(), 'i') }
      ];
    }
    if (skill && skill.trim()) query.skill = new RegExp(skill.trim(), 'i');
    if (difficulty) query.difficulty = difficulty;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const groups = await Group.find(query)
      .populate('creator', 'name avatar bio skillsToTeach skillsToLearn')
      .populate('members.user', 'name avatar bio skillsToTeach skillsToLearn')
      .sort({ createdAt: -1 })
      .limit(50);
      
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members.user', 'name avatar bio skillsToTeach skillsToLearn reputation')
      .populate('creator', 'name avatar bio skillsToTeach skillsToLearn reputation');
    
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send a join request (Requires creator approval)
export const requestToJoinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Cannot request if already creator or member
    const isCreator = group.creator.toString() === req.user.id;
    if (isCreator) {
      return res.status(400).json({ message: 'You are the creator of this group' });
    }

    const isMember = group.members.some(m => (m.user?._id || m.user || m).toString() === req.user.id);
    if (isMember) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: 'Group has reached maximum capacity' });
    }

    // Check for existing pending request
    const existingPending = await GroupJoinRequest.findOne({
      group: group._id,
      requester: req.user.id,
      status: 'pending'
    });

    if (existingPending) {
      return res.status(400).json({ message: 'You already have a pending join request for this group' });
    }

    const { message } = req.body;
    const joinRequest = await GroupJoinRequest.create({
      group: group._id,
      requester: req.user.id,
      status: 'pending',
      message: message || ''
    });

    // Notify group creator
    const currentUser = await User.findById(req.user.id);
    await Notification.create({
      user: group.creator,
      type: 'group_invite',
      title: 'New Group Join Request',
      message: `${currentUser?.name || 'A learner'} requested to join your group "${group.name}".`,
      relatedId: group._id,
      relatedModel: 'Group'
    });

    res.status(201).json({
      message: 'Join request sent successfully. Waiting for creator approval.',
      request: joinRequest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending requests for a group (Creator/Admin only)
export const getGroupRequests = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isCreatorOrAdmin = group.creator.toString() === req.user.id ||
      group.members.some(m => (m.user?._id || m.user).toString() === req.user.id && m.role === 'admin');

    if (!isCreatorOrAdmin) {
      return res.status(403).json({ message: 'Only group creator or admin can view join requests' });
    }

    const requests = await GroupJoinRequest.find({
      group: req.params.id,
      status: 'pending'
    }).populate('requester', 'name avatar bio skillsToTeach skillsToLearn reputation');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user's join requests
export const getMyGroupRequests = async (req, res) => {
  try {
    const requests = await GroupJoinRequest.find({
      requester: req.user.id
    }).populate('group', 'name skill difficulty creator maxMembers');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept a join request (Creator/Admin only)
export const acceptJoinRequest = async (req, res) => {
  try {
    const request = await GroupJoinRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const group = await Group.findById(request.group);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isCreatorOrAdmin = group.creator.toString() === req.user.id ||
      group.members.some(m => (m.user?._id || m.user).toString() === req.user.id && m.role === 'admin');

    if (!isCreatorOrAdmin) {
      return res.status(403).json({ message: 'Not authorized to accept requests for this group' });
    }

    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: 'Group is full' });
    }

    // Add requester as member if not already
    const alreadyMember = group.members.some(m => (m.user?._id || m.user).toString() === request.requester.toString());
    if (!alreadyMember) {
      group.members.push({
        user: request.requester,
        role: 'member',
        joinedAt: new Date()
      });
      await group.save();
      await User.findByIdAndUpdate(request.requester, { $addToSet: { groups: group._id } });
    }

    request.status = 'accepted';
    await request.save();

    // Notify requester
    await Notification.create({
      user: request.requester,
      type: 'group_invite',
      title: 'Group Join Request Accepted!',
      message: `Your request to join "${group.name}" was accepted by the creator!`,
      relatedId: group._id,
      relatedModel: 'Group'
    });

    const updatedGroup = await Group.findById(group._id)
      .populate('members.user', 'name avatar bio skillsToTeach skillsToLearn reputation')
      .populate('creator', 'name avatar bio skillsToTeach skillsToLearn reputation');

    res.json({
      message: 'Join request accepted successfully',
      group: updatedGroup,
      request
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject a join request (Creator/Admin only)
export const rejectJoinRequest = async (req, res) => {
  try {
    const request = await GroupJoinRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const group = await Group.findById(request.group);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isCreatorOrAdmin = group.creator.toString() === req.user.id ||
      group.members.some(m => (m.user?._id || m.user).toString() === req.user.id && m.role === 'admin');

    if (!isCreatorOrAdmin) {
      return res.status(403).json({ message: 'Not authorized to reject requests for this group' });
    }

    request.status = 'rejected';
    await request.save();

    // Notify requester
    await Notification.create({
      user: request.requester,
      type: 'group_invite',
      title: 'Group Request Update',
      message: `Your request to join "${group.name}" was declined.`,
      relatedId: group._id,
      relatedModel: 'Group'
    });

    res.json({
      message: 'Join request rejected',
      request
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.creator.toString() === req.user.id) {
      return res.status(400).json({ message: 'Creator cannot leave the group. You can delete the group if needed.' });
    }

    group.members = group.members.filter(m => (m.user?._id || m.user).toString() !== req.user.id);
    await group.save();

    await User.findByIdAndUpdate(req.user.id, { $pull: { groups: group._id } });

    res.json({ message: 'Left group successfully', group });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.creator.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    Object.assign(group, req.body);
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addRoadmapItem = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    group.roadmap.push(req.body);
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleRoadmapItem = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const itemIndex = parseInt(req.params.itemIndex, 10);
    if (group.roadmap[itemIndex]) {
      group.roadmap[itemIndex].completed = !group.roadmap[itemIndex].completed;
      await group.save();
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addResource = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const resource = { ...req.body, addedBy: req.user.id };
    group.resources.push(resource);
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addTask = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    group.tasks.push(req.body);
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleTask = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const taskIndex = parseInt(req.params.taskIndex, 10);
    if (group.tasks[taskIndex]) {
      group.tasks[taskIndex].completed = !group.tasks[taskIndex].completed;
      await group.save();
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip, 10) || 0;
    const messages = await GroupMessage.find({ group: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(50)
      .populate('sender', 'name avatar');
    
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Authorization check: only the creator can delete the group
    if (group.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized: Only the group host can delete this group' });
    }

    const groupId = group._id;

    // 1. Remove group from all members' user documents
    await User.updateMany(
      { groups: groupId },
      { $pull: { groups: groupId } }
    );

    // 2. Delete all join requests for this group
    await GroupJoinRequest.deleteMany({ group: groupId });

    // 3. Delete all messages for this group
    await GroupMessage.deleteMany({ group: groupId });

    // 4. Delete the group itself
    await Group.findByIdAndDelete(groupId);

    res.json({ message: 'Group deleted successfully', groupId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addGroupGoal = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only group host can add learning goals' });
    }
    const { goal } = req.body;
    if (!goal || !goal.trim()) return res.status(400).json({ message: 'Goal text is required' });
    
    if (!group.goals) group.goals = [];
    group.goals.push(goal.trim());
    await group.save();
    
    const updated = await Group.findById(group._id)
      .populate('members.user', 'name avatar bio skillsToTeach skillsToLearn reputation')
      .populate('creator', 'name avatar bio skillsToTeach skillsToLearn reputation');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGroupGoal = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only group host can remove learning goals' });
    }
    const goalIndex = parseInt(req.params.goalIndex, 10);
    if (group.goals && group.goals[goalIndex] !== undefined) {
      group.goals.splice(goalIndex, 1);
      await group.save();
    }
    
    const updated = await Group.findById(group._id)
      .populate('members.user', 'name avatar bio skillsToTeach skillsToLearn reputation')
      .populate('creator', 'name avatar bio skillsToTeach skillsToLearn reputation');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
