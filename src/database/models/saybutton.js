import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    guildId: { type: String, required: true },
    enabled: { type: Boolean, default: true },
})

export default mongoose.model("saybutton", schema);