import User from '../models/User.js';
import Group from '../models/Group.js';

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const createdGroups = await Group.find({ creator: user._id })
      .populate('creator', 'name avatar')
      .sort({ createdAt: -1 });

    const joinedGroups = await Group.find({
      'members.user': user._id,
      creator: { $ne: user._id }
    }).populate('creator', 'name avatar').sort({ createdAt: -1 });

    const userObj = user.toObject();
    userObj.createdGroups = createdGroups;
    userObj.joinedGroups = joinedGroups;

    res.json({
      user: userObj,
      createdGroups,
      joinedGroups
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    const updatedUser = await user.save();
    const userObj = updatedUser.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSkills = async (req, res) => {
  try {
    const { skillsToTeach, skillsToLearn } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (skillsToTeach !== undefined) user.skillsToTeach = skillsToTeach;
    if (skillsToLearn !== undefined) user.skillsToLearn = skillsToLearn;

    const updatedUser = await user.save();
    const userObj = updatedUser.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q, skill, type } = req.query;
    
    // Always strictly exclude currently logged-in user
    const query = {
      _id: { $ne: req.user.id }
    };

    const conditions = [];

    if (q && q.trim()) {
      conditions.push({
        $or: [
          { name: new RegExp(q.trim(), 'i') },
          { bio: new RegExp(q.trim(), 'i') },
          { 'skillsToTeach.name': new RegExp(q.trim(), 'i') },
          { 'skillsToLearn.name': new RegExp(q.trim(), 'i') }
        ]
      });
    }

    if (skill && skill.trim()) {
      if (type === 'teach') {
        conditions.push({ 'skillsToTeach.name': new RegExp(skill.trim(), 'i') });
      } else if (type === 'learn') {
        conditions.push({ 'skillsToLearn.name': new RegExp(skill.trim(), 'i') });
      } else {
        conditions.push({
          $or: [
            { 'skillsToTeach.name': new RegExp(skill.trim(), 'i') },
            { 'skillsToLearn.name': new RegExp(skill.trim(), 'i') }
          ]
        });
      }
    }

    if (conditions.length > 0) {
      query.$and = conditions;
    }

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
