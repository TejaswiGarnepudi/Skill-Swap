import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  avatar: { type: String, default: '' },
  bio: { type: String, maxlength: 500 },
  skillsToTeach: { 
    type: [skillSchema], 
    default: [] 
  },
  skillsToLearn: { 
    type: [skillSchema], 
    default: [] 
  },
  skillCredits: { type: Number, default: 5 },
  teachingHours: { type: Number, default: 0 },
  learningHours: { type: Number, default: 0 },
  reputation: {
    knowledge: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    helpfulness: { type: Number, default: 0 },
    overall: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }]
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
