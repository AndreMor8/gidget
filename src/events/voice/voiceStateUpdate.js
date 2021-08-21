import db from '../../database/models/voicerole.js';

export default async (bot, oldState, newState) => {

  const member = newState?.member || oldState?.member;
  const guild = newState?.guild || oldState?.guild;
  //VOICEROLE
  if (member && guild.me.permissions.has("MANAGE_ROLES")) {
    const list = await db.findOne({ guildID: { $eq: guild.id } });
    if (list && list.enabled) {
      const thing1 = list.list.find(e => e.channels.includes(newState?.channelId));
      const thing2 = list.list.find(e => e.channels.includes(oldState?.channelId));
      if (thing1 && !thing2) {
        if (!member.roles.cache.has(thing1.roleID)) {
          const algo = guild.roles.cache.get(thing1.roleID);
          if (algo && algo.editable && !algo.managed) {
            await member.roles.add(thing1.roleID, "Voice-role").catch(() => { });
          }
        }
      } else if (thing1 && thing2) {
        if (thing1.roleID === thing2.roleID) return;
        if (!member.roles.cache.has(thing1.roleID)) {
          const algo = guild.roles.cache.get(thing1.roleID);
          if (algo && algo.editable && !algo.managed) {
            await member.roles.add(thing1.roleID, "Voice-role").catch(() => { });
          }
        }
        if (member.roles.cache.has(thing2.roleID)) {
          const algo = guild.roles.cache.get(thing2.roleID);
          if (algo && algo.editable && !algo.managed) {
            await member.roles.remove(thing2.roleID, "Voice-role").catch(() => { });
          }

        }
      } else if (!thing1 && thing2) {
        if (member.roles.cache.has(thing2.roleID)) {
          const algo = guild.roles.cache.get(thing2.roleID);
          if (algo && algo.editable && !algo.managed) {
            await member.roles.remove(thing2.roleID, "Voice-role").catch(() => { });
          }
        }
      }
    }
  }
}