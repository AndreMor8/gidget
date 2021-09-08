import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  guildid: { type: String, required: true },
  muteroleid: { type: String, required: true }
});

export default mongoose.model('muterole', MessageSchema);