import Rating from '../models/Rating.js';
import User from '../models/User.js';

export const createRating = async (req, res) => {
  try {
    const { to, session, knowledge, communication, helpfulness, comment } = req.body;

    const rating = await Rating.create({
      from: req.user.id,
      to,
      session,
      knowledge,
      communication,
      helpfulness,
      comment
    });

    const targetUser = await User.findById(to);
    if (targetUser) {
      const allRatings = await Rating.find({ to });
      const count = allRatings.length;

      const avgK = allRatings.reduce((acc, r) => acc + r.knowledge, 0) / count;
      const avgC = allRatings.reduce((acc, r) => acc + r.communication, 0) / count;
      const avgH = allRatings.reduce((acc, r) => acc + r.helpfulness, 0) / count;
      const avgOverall = (avgK + avgC + avgH) / 3;

      targetUser.reputation = {
        knowledge: avgK,
        communication: avgC,
        helpfulness: avgH,
        overall: avgOverall,
        count
      };
      await targetUser.save();
    }

    res.status(201).json(rating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ to: req.params.userId }).populate('from', 'name avatar');
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
