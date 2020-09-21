import mongoose from 'mongoose'
const MessageSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    responses: { type: mongoose.Schema.Types.Mixed, required: true }
});

export default mongoose.model('customresponse', MessageSchema);