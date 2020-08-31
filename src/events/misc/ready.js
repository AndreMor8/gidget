const { version } = require("../../index.js")
const presence = require("../../utils/presences");
const tempmute = require("../../utils/tempmute");
const poll = require("../../utils/poll");
const MessageModel2 = require('../../database/models/mutedmembers.js');
const MessageModel3 = require('../../database/models/poll.js');
var psi = setInterval(presence, 1800000);
module.exports = async bot => {
  require("../../webserver");
  presence();
  let doc = await MessageModel2.findOne();
  if (doc) {
    tempmute();
  }
  let doc2 = await MessageModel3.findOne();
  if (doc2) {
    poll();
  }
  const guildsToFetch = bot.guilds.cache.filter(e => e.me.hasPermission("MANAGE_GUILD")).array();
  for(const guild of guildsToFetch) {
    guild.inviteCount = await guild.getInviteCount().catch(err => {
      console.log(err);
      return {};
    });
  }
  console.log(`Gidget is alive! Version ` + version);
};

//For clean the interval with a command
module.exports.psi = psi;