const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    discordId: { type: String, required: true }
})

module.exports = mongoose.model("OAuth2Credential", schema);