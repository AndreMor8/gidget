const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
    channelId: { type: String, required: true },
    messageId: { type: String, required: true },
    date: { type: Date, required: true },
    reactions: { type: Array }
});

const MessageModel = module.exports = mongoose.model('polltimes', MessageSchema);