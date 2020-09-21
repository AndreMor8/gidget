import mongoose from 'mongoose'
const MessageSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    messageId: { type: String, required: true },
    channelId: { type: String, required: true },
    emojiId: { type: String, required: true },
    categoryId: { type: String },
    roles: { type: Array },
    manual: { type: Boolean },
    perms: { type: Array },
    welcomemsg: { type: String, required: true },
    desc: { type: String }
});

export default mongoose.model('ticket', MessageSchema);