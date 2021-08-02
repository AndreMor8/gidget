import mongoose from 'mongoose';

const sch = new mongoose.Schema({
  guildId: { type: String, required: true },
  memberId: { type: String, required: true },
  reason: { type: String, default: "" }
}, { timestamps: { createdAt: "created" } });

export default mongoose.model('warn-members', sch);