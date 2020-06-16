const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
    guildid: { type: String, required: true },
    word: { type: String, required: true },
    roleid: { type: String, required: true }
});

const MessageModel = module.exports = mongoose.model('selfrole', MessageSchema);