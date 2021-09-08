import mongoose from 'mongoose';

const thing = new mongoose.Schema({
  guildID: { type: String, required: true },
  enabled: { type: Boolean, default: false }
});

export default mongoose.model("messagelink", thing);