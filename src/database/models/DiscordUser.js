import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  discordId: { type: String, required: true },
  username: { type: String, required: true },
  avatar: { type: String },
  premium_type: { type: Number }
});
export default mongoose.model('User', UserSchema);
