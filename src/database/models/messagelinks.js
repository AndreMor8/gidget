const mongoose = require("mongoose");

const thing = new mongoose.Schema({
    guildID: { type: String, required: true },
    enabled: { type: Boolean, default: false }
});

module.exports = mongoose.model("messagelink", thing);