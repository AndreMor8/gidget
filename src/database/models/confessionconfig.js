import mongoose from 'mongoose';

const sch = new mongoose.Schema({
    guildID: { type: String, required: true },
    channelID: { type: String, required: true },
    anon: { type: Boolean, default: false }
});

export default mongoose.model("confession", sch);