const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
    guildid: { type: String, required: true },
    role: { type: Boolean, required: true },
    roletime: { type: Number, default: 0 },
    roleid: { type: String, default: '0' },
    kick: { type: Boolean, required: true },
    kicktime: { type: Number, default: 0 },
    ban: { type: Boolean, required: true },
    bantime: { type: Number, default: 0 }
});

const MessageModel = module.exports = mongoose.model('warn-system', MessageSchema);