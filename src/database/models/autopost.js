import mongoose from 'mongoose';

const sch = new mongoose.Schema({
  guildID: { type: String, required: true },
  channels: { type: Array, default: [] }
});

export default mongoose.model("autopost", sch);