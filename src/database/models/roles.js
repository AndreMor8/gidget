import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  guildid: { type: String, required: true },
  memberid: { type: String, required: true },
  roles: { type: Array }
});

export default mongoose.model('roles', MessageSchema);