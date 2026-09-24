import { getMatchesForUser } from '../services/matchingService.js';

export const getMatches = async (req, res) => {
  try {
    const matches = await getMatchesForUser(req.user.id);
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMatchDetail = async (req, res) => {
  try {
    const matches = await getMatchesForUser(req.user.id);
    const detail = matches.find(m => m.user.id.toString() === req.params.userId);
    if (!detail) {
      return res.status(404).json({ message: 'Match not found' });
    }
    res.json(detail);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
