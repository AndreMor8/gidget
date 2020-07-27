const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  author: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String, required: true },
  date: { type: Date, required: true }
});

module.exports = mongoose.model('wubbzymedia-a', schema);