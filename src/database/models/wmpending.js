import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  author: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String, required: true },
  date: { type: Date, required: true }
});

export default mongoose.model('wubbzymedia-p', schema);