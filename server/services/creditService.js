import User from '../models/User.js';

export const awardTeachingCredit = async (userId, hours) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  user.skillCredits += hours;
  user.teachingHours += hours;
  await user.save();
  return user;
};

export const spendLearningCredit = async (userId, hours) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (user.skillCredits < hours) {
    throw new Error('Not enough skill credits');
  }

  user.skillCredits -= hours;
  user.learningHours += hours;
  await user.save();
  return user;
};

export const getBalance = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  return user.skillCredits;
};
