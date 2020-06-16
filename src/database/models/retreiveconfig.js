const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    enabled: { type: Boolean, required: true },
});

const MessageModel = module.exports = mongoose.model('retreiveconfig', MessageSchema);