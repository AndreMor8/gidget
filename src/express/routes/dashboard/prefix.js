const prefix = require("../../../database/models/prefix.js");
module.exports = {
  get: async (guildID) => {
  let msgDocument = await prefix.findOne({ guildId: guildID });
        if (msgDocument) return msgDocument;
        else {
          return await new prefix({
            guildId: guildID,
            prefix: "g%"
          }).save();
        }
},
  post: async (req) => {
    let msgDocument = await prefix.findOne({ guildId: req.params.guildID })
        if(msgDocument) {
         await msgDocument.updateOne({ prefix: req.body.prefix });
        } else {
          await new prefix({
            guildId: req.params.guildID,
            prefix: req.body.prefix
          });
        }
  }
}