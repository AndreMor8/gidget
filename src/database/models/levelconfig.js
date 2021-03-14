import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  levelnotif: { type: Boolean, default: false },
  levelsystem: { type: Boolean, default: false },
  roles: { type: Array, default: [] },
  nolevel: { type: Array, default: [] }
});

export default mongoose.model('levelconfig', MessageSchema);