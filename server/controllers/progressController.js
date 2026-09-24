import LearningProgress from '../models/LearningProgress.js';

export const getMyProgress = async (req, res) => {
  try {
    const progress = await LearningProgress.find({ user: req.user.id }).sort('-updatedAt');
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrUpdateProgress = async (req, res) => {
  try {
    const { skill, topics, source, sourceId } = req.body;

    let progress = await LearningProgress.findOne({ user: req.user.id, skill });

    if (progress) {
      if (topics) {
        topics.forEach(t => {
          if (!progress.topics.find(pt => pt.name === t.name)) {
            progress.topics.push({ name: t.name, completed: false });
          }
        });
      }
      await progress.save();
    } else {
      progress = await LearningProgress.create({
        user: req.user.id,
        skill,
        topics: topics || [],
        source,
        sourceId
      });
    }
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleTopic = async (req, res) => {
  try {
    const progress = await LearningProgress.findById(req.params.id);
    if (!progress) return res.status(404).json({ message: 'Progress not found' });

    if (progress.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const topicIndex = parseInt(req.params.topicIndex, 10);
    if (progress.topics[topicIndex]) {
      progress.topics[topicIndex].completed = !progress.topics[topicIndex].completed;
      progress.topics[topicIndex].completedAt = progress.topics[topicIndex].completed ? new Date() : null;
      
      const completedCount = progress.topics.filter(t => t.completed).length;
      progress.progress = progress.topics.length === 0 ? 0 : Math.round((completedCount / progress.topics.length) * 100);

      if (progress.progress === 100 && !progress.completedAt) {
        progress.completedAt = new Date();
      } else if (progress.progress < 100) {
        progress.completedAt = null;
      }

      await progress.save();
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
