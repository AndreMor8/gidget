import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  channelId: { type: String, required: true },
  messageId: { type: String, required: true },
  date: { type: Date, required: false },
  reactions: { type: Array }
});

export default mongoose.model('polltimes', MessageSchema);