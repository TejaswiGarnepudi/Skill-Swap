import mongoose from 'mongoose';

const groupJoinRequestSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
    index: true
  },
  message: { type: String, default: '' }
}, { timestamps: true });

groupJoinRequestSchema.index({ group: 1, requester: 1 });

const GroupJoinRequest = mongoose.model('GroupJoinRequest', groupJoinRequestSchema);
export default GroupJoinRequest;
