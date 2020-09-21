import mongoose from 'mongoose'
const MessageSchema = new mongoose.Schema({
    guildid: { type: String, required: true },
    memberid: { type: String, required: true },
    warnings: 0,
});

export default mongoose.model('warn-members', MessageSchema);