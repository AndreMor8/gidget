import mongoose from 'mongoose'
const MessageSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    enabled: { type: Boolean, required: true },
});

export default mongoose.model('retreiveconfig', MessageSchema);