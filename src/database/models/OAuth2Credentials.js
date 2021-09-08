import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  discordId: { type: String, required: true },
  invalid: { type: Boolean, default: false }
});

export default mongoose.model("OAuth2Credential", schema);