const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    prefix: { type: String, required: true }
});

const MessageModel = module.exports = mongoose.model('prefix', MessageSchema);