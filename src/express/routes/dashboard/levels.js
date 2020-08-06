const levels = require("../../../database/models/levelconfig.js");
module.exports = {
  get: async (guildID) => {
  let msgDocument = await levels.findOne({ guildId: guildID });
        if (msgDocument) return msgDocument;
        else {
          return await new levels({
            guildId: guildID,
            levelnotif: false,
            levelsystem: false,
            roles: []
          }).save();
        }
},
  post: async (req) => {
    let msgDocument = await levels.findOne({ guildId: req.params.guildID })
        if(msgDocument) {
         await msgDocument.updateOne({ levelsystem: (req.body.system === 'true' ? true : false), levelnotif: (req.body.notif === 'true' ? true : false) })
        } else {
          await new levels({
            levelsystem: (req.body.system === 'true' ? true : false),
            levelnotif: (req.body.notif === 'true' ? true : false),
            guildId: req.params.guildID,
            roles: []
          });
        }
  }
}