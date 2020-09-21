import mongoose from 'mongoose'
const MessageSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    prefix: { type: String, required: true, default: "g%" }
});

export default mongoose.model('prefix', MessageSchema);