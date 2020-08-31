const mongoose = require("mongoose");

const chema = new mongoose.Schema({
    guildID: { type: String, required: true },
    enabled: { type: Boolean, default: false },
    text: { type: String, default: "Welcome to the server, %MEMBER%" },
    channelID: { type: String, default: null },
    dmenabled: { type: Boolean, default: false },
    dmtext: { type: String, default: "Welcome to the server, %MEMBER%" },
    leaveenabled: { type: Boolean, default: false },
    leavechannelID: { type: String, default: null },
    leavetext: { type: String, default: "We're sorry to see you leaving, %MEMBER%" }
});

module.exports = mongoose.model("welcome", chema);