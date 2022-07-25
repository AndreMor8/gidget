import db from '../../database/models/voicerole.js';

export default async (bot, oldState, newState) => {
  const member = newState.member || oldState.member;
  const guild = newState.guild || oldState.guild;

  //RECORD COMMAND - STOP RECORDING
  if (bot.records.has(guild.id)) {
    const rec = bot.records.get(guild.id);
    if (!newState.channelId && (member.id === rec.user_id || member.id === bot.user.id)) {
      rec.stream.destroy();
    }
    if (((!!newState.channelId && !!oldState.channelId) && (newState.channelId !== oldState.channelId)) && (member.id === rec.user_id || member.id === bot.user.id)) {
      rec.stream.destroy();
    }
  }

  //VOICEROLE
  if (member && guild.members.me.permissions.has("ManageRoles")) {
    const list = await db.findOne({ guildID: { $eq: guild.id } }).lean();
    if (list && list.enabled) {
      const thing1 = list.list.find(e => e.channels.includes(newState.channelId));
      const thing2 = list.list.find(e => e.channels.includes(oldState.channelId));
      if (thing1 && !thing2) {
        if (!member.roles.cache.has(thing1.roleID)) {
          const algo = guild.roles.cache.get(thing1.roleID);
          if (algo && algo.editable && !algo.managed) {
            await member.roles.add(thing1.roleID, "Voice-role").catch(() => { });
          }
        }
      } else if (thing1 && thing2) {
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