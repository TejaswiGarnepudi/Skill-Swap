import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Group from '../models/Group.js';
import env from '../config/env.js';

const generateToken = (id) => {
  return jwt.sign({ id }, env.jwtSecret, { expiresIn: '30d' });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    const userObj = user.toObject();
    delete userObj.password;
    userObj.createdGroups = [];
    userObj.joinedGroups = [];

    res.status(201).json({ token, user: userObj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      const userObj = user.toObject();
      delete userObj.password;

      const createdGroups = await Group.find({ creator: user._id })
        .populate('creator', 'name avatar')
        .sort({ createdAt: -1 });

      const joinedGroups = await Group.find({
        'members.user': user._id,
        creator: { $ne: user._id }
      }).populate('creator', 'name avatar').sort({ createdAt: -1 });

      userObj.createdGroups = createdGroups;
      userObj.joinedGroups = joinedGroups;

      res.json({ token, user: userObj });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

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

    res.json({ user: userObj, createdGroups, joinedGroups });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
