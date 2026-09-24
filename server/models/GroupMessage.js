import mongoose from 'mongoose';

const groupMessageSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['message', 'doubt', 'resource', 'announcement'], default: 'message' },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupMessage', default: null }
}, { timestamps: true });

groupMessageSchema.index({ group: 1, createdAt: -1 });

const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema);
export default GroupMessage;
