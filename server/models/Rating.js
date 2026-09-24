import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  knowledge: { type: Number, min: 1, max: 5, required: true },
  communication: { type: Number, min: 1, max: 5, required: true },
  helpfulness: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String }
}, { timestamps: true });

const Rating = mongoose.model('Rating', ratingSchema);
export default Rating;
