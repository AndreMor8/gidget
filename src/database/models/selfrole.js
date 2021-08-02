import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  guildid: { type: String, required: true },
  word: { type: String, required: true },
  roleid: { type: String, required: true }
});

export default mongoose.model('selfrole', MessageSchema);