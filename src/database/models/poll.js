import mongoose from 'mongoose'
const MessageSchema = new mongoose.Schema({
    channelId: { type: String, required: true },
    messageId: { type: String, required: true },
    date: { type: Date, required: true },
    reactions: { type: Array }
});

export default mongoose.model('polltimes', MessageSchema);