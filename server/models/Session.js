import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  topic: { type: String, required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: Number, required: true },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  }
}, { timestamps: true });

const Session = mongoose.model('Session', sessionSchema);
export default Session;
