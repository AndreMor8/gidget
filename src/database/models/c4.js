import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  userId: { type: String, required: true },
  wins: { type: Number, default: 0 },
  loses: { type: Number, default: 0 },
  difficulty: { type: String, default: "medium" },
  cacheName: { type: String }
});

export default mongoose.model('c4top', schema);