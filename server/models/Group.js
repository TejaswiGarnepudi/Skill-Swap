import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  skill: { type: String, required: true },
  category: { type: String, default: 'General' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now }
  }],
  maxMembers: { type: Number, default: 20 },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  startDate: { type: Date },
  endDate: { type: Date },
  goals: [{ type: String }],
  roadmap: [{
    day: { type: Number },
    title: { type: String },
    description: { type: String },
    completed: { type: Boolean, default: false }
  }],
  tasks: [{
    title: { type: String },
    description: { type: String },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  resources: [{
    title: { type: String },
    url: { type: String },
    type: { type: String },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Group = mongoose.model('Group', groupSchema);
export default Group;
