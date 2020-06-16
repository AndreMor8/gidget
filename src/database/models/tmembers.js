const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    memberId: { type: String, required: true },
    channelId: { type: String, required: true },
    from: { type: String, required: true }
});

const MessageModel = module.exports = mongoose.model('tmember', MessageSchema);