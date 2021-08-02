import mongoose from 'mongoose';

const sch = new mongoose.Schema({
  list: { type: Array, default: [] },
  guildID: { type: String, required: true },
  enabled: { type: Boolean, default: false }
});

export default mongoose.model("voicerole", sch);