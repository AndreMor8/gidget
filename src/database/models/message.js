import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  messageId: { type: String, required: true },
  emojiRoleMappings: { type: mongoose.Schema.Types.Mixed }
});

export default mongoose.model('message', MessageSchema);