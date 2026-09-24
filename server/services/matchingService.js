import User from '../models/User.js';

export const getMatchesForUser = async (userId) => {
  const currentUser = await User.findById(userId);
  if (!currentUser) return [];

  const allUsers = await User.find({ _id: { $ne: userId } });
  const matches = [];

  for (const candidate of allUsers) {
    const candidateSkillsToTeach = candidate.skillsToTeach.map(s => s.name.toLowerCase());
    const candidateSkillsToLearn = candidate.skillsToLearn.map(s => s.name.toLowerCase());
    const currentSkillsToTeach = currentUser.skillsToTeach.map(s => s.name.toLowerCase());
    const currentSkillsToLearn = currentUser.skillsToLearn.map(s => s.name.toLowerCase());

    const canTeachMe = candidateSkillsToTeach.filter(s => currentSkillsToLearn.includes(s));
    const canLearnFromMe = currentSkillsToTeach.filter(s => candidateSkillsToLearn.includes(s));

    if (canTeachMe.length === 0 && canLearnFromMe.length === 0) continue;

    const totalPossible = currentSkillsToLearn.length + currentSkillsToTeach.length;
    if (totalPossible === 0) continue;

    const matched = canTeachMe.length + canLearnFromMe.length;
    let base = (matched / totalPossible) * 100;
    
    let bonus = 0;
    if (canTeachMe.length > 0 && canLearnFromMe.length > 0) {
      bonus = 15;
    }

    let matchScore = Math.min(base + bonus, 100);

    matches.push({
      user: {
        id: candidate._id,
        name: candidate.name,
        avatar: candidate.avatar,
        bio: candidate.bio,
        reputation: candidate.reputation
      },
      matchPercentage: Math.round(matchScore),
      canTeachYou: canTeachMe,
      canLearnFromYou: canLearnFromMe,
      mutualExchange: (canTeachMe.length > 0 && canLearnFromMe.length > 0)
    });
  }

  matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
  return matches;
};
