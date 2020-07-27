const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
    guildid: { type: String, required: true },
    memberid: { type: String, required: true },
    roles: { type: Array }
});

const MessageModel = module.exports = mongoose.model('roles', MessageSchema);