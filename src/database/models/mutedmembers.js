const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    memberId: { type: String, required: true },
    date: { type: Date, required: true }
});

const MessageModel = module.exports = mongoose.model('mutedmembers', MessageSchema);