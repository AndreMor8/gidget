import OAuth2 from "../database/models/OAuth2Credentials.js";
import CryptoJS from "crypto-js";

const cache = new Map();

export default async function (user) {
  const saved = cache.get(user.id);
  if (saved) return saved;
  const data = await OAuth2.findOne({ discordId: { $eq: user.id } }).lean().exec();
  if (!data) {
    const thing = { type: null, value: -1 };
    cache.set(user.id, thing);
    setTimeout((id) => cache.delete(id), 60000, user.id);
    return thing;
  } else if (data.invalid) {
    const thing = { type: null, value: -1 };
    cache.set(user.id, thing);
    setTimeout((id) => cache.delete(id), 60000, user.id);
    return thing;
  } else {
    const token = CryptoJS.AES.decrypt(data.accessToken, process.env.VERYS);
    const dectoken = token.toString(CryptoJS.enc.Utf8);
    const res = await fetch(`https://discord.com/api/v${user.client.options.ws.version}/users/@me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${dectoken}` }
    });
    if (res.ok) {
      const json = await res.json();
      const thing = { type: "oauth2", value: json.premium_type || 0 };
      cache.set(user.id, thing);
      setTimeout((id) => cache.delete(id), 60000, user.id);
      return thing;
    } else {
      OAuth2.updateOne({ discordId: { $eq: user.id } }, { invalid: true }).exec();
      const thing = { type: null, value: -1 };
      cache.set(user.id, thing)
      setTimeout((id) => cache.delete(id), 60000, user.id);
      return thing;
    }
  }
}