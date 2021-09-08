import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  memberId: { type: String, required: true },
  channelId: { type: String, required: true },
  from: { type: String, required: true }
});

export default mongoose.model('tmember', MessageSchema);