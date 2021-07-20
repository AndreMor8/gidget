import mongoose from 'mongoose'
const MessageSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    messageId: { type: String, required: true },
    channelId: { type: String, required: true },
    emojiId: { type: String },
    categoryId: { type: String },
    roles: { type: Array },
    manual: { type: Boolean },
    welcomemsg: { type: String },
    desc: { type: String }
});

export default mongoose.model('ticket', MessageSchema);