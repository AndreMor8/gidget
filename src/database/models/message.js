const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    messageId: { type: String, required: true },
    emojiRoleMappings: { type: mongoose.Schema.Types.Mixed }
});

const MessageModel = module.exports = mongoose.model('message', MessageSchema);