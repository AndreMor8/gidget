import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  memberId: { type: String, required: true },
  date: { type: Date, required: true }
});

export default mongoose.model('mutedmembers', MessageSchema);