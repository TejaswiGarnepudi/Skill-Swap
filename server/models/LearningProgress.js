import mongoose from 'mongoose';

const learningProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill: { type: String, required: true },
  topics: [{
    name: { type: String },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date }
  }],
  progress: { type: Number, default: 0 },
  source: { type: String, enum: ['exchange', 'group', 'self'], default: 'self' },
  sourceId: { type: mongoose.Schema.Types.ObjectId },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}, { timestamps: true });

const LearningProgress = mongoose.model('LearningProgress', learningProgressSchema);
export default LearningProgress;
