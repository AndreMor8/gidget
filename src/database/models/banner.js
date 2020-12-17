import mongoose from 'mongoose';
//[{ banner: "url", hour: 5 }] (new york)
const sch = new mongoose.Schema({
    guildID: { type: String, required: true },
    banners: [{
        url: { type: String, required: true },
        hour: { type: Number, required: true }
    }],
    enabled: { type: Boolean, default: true }
});

export default mongoose.model("banner", sch);