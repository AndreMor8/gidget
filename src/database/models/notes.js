import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  userID: { type: String, required: true },
  note: { type: String, default: "" }
});

export default mongoose.model('note', schema);