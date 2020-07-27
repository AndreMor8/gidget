const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
    guildid: { type: String, required: true },
    muteroleid: { type: String, required: true }
});

const MessageModel = module.exports = mongoose.model('muterole', MessageSchema);