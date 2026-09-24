import mongoose from 'mongoose';

const exchangeRequestSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillToLearn: { type: String, required: true },
  skillToTeach: { type: String, required: true },
  message: { type: String },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

const ExchangeRequest = mongoose.model('ExchangeRequest', exchangeRequestSchema);
export default ExchangeRequest;
