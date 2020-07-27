const { bot } = require("../../index");
const permissions = require("./permissions");
const fetch = require("node-fetch");
let gcache;

module.exports = {
  guilds: function (memberId) {
    if(memberId) {
      return bot.guilds.cache.filter(e => e.members.cache.has(memberId)).map(e => e.id);
    } else {
      return bot.guilds.cache.map(e => e.id);
    }
  },
  getPermissions: function(perm) {
    const permissionMap = new Map();
    for (const [key, value] of Object.entries(permissions)) {
      if ((perm & value) == value) permissionMap.set(key, value);
    }
    return permissionMap;
  },
  roles: async function (guildID, memberID) {
    const guild = bot.guilds.cache.get(guildID);
    if(!guild) return false;
    const member = guild.members.cache.get(memberID) || memberID ? await guild.members.fetch(memberID).catch(err => {}) : undefined
    if(!member) return false;
    return member.roles.cache.map(r => {
      return {
        name: r.name,
        id: r.id
      }
    })
  },
  getGuilds: async function (guilds) {
    if (gcache) return gcache;
    else setTimeout(() => (gcache = undefined), 120000);
    const guildMemberPermissions = new Map();
    const ext = this.guilds();
    guilds.forEach(guild => {
      const perm = this.getPermissions(guild.permissions);
      guildMemberPermissions.set(guild.id, perm);
    });
    const toshow = guilds.filter(e => {
      if (!ext.includes(e.id)) return;
      const p = guildMemberPermissions.get(e.id);
      if (p && p.get("ADMINISTRATOR")) return true;
      else return false;
    });
    gcache = toshow;
    return toshow;
  },
  deleteCache: (guildID) => {
    bot.cachedMessageReactions.delete(guildID);
    bot.autoresponsecache.delete(guildID);
    bot.level.delete(guildID);
    bot.rrcache.delete(guildID);
    bot.guildprefix.delete(guildID);
  }
};
