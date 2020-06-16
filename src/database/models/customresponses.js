const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    responses: { type: mongoose.Schema.Types.Mixed, required: true }
});

const MessageModel = module.exports = mongoose.model('customresponse', MessageSchema);