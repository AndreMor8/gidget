const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  levelnotif: { type: Boolean, default: false },
  levelsystem: { type: Boolean, default: false }
});

const MessageModel = module.exports = mongoose.model('levelconfig', MessageSchema);