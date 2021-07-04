import mongoose from 'mongoose'
const sch = new mongoose.Schema({
    guildId: { type: String, required: true },
    roles: [{
        id: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String, default: null },
        emoji: { type: String, default: null }
    }]
});
export default mongoose.model('selectrole', sch);