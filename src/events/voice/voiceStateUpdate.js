import db from '../../database/models/voicerole.js';

export default async (bot, oldState, newState) => {

  const member = newState?.member || oldState?.member;
  const guild = newState?.guild || oldState?.guild;
  //VOICEROLE
  if (member && guild.me.permissions.has("MANAGE_ROLES")) {
    const list = await db.findOne({ guildID: { $eq: guild.id } });
    if (list && list.enabled) {
      const thing1 = list.list.find(e => e.channels.includes(newState?.channelID));
      const thing2 = list.list.find(e => e.channels.includes(oldState?.channelID));
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

  /*/MUSIC
  const musicVariables = guild.musicVariables;
  if (musicVariables && !newState?.channel && (member.id === bot.user.id)) {
    guild.queue = null;
    guild.musicVariables = null;
  }
  const serverQueue = guild.queue;
  if (!serverQueue) return;
  if (!serverQueue.voiceChannel || !serverQueue.textChannel) return;
  if (!musicVariables) return;
  if (member.id === bot.user.id && serverQueue.voiceChannel.id !== newState?.channelID) {
    serverQueue.voiceChannel = newState.channel;
    serverQueue.playing = false;
    serverQueue.connection.dispatcher.pause();
    musicVariables.i = 1;
    musicVariables.time = setTimeout(async () => {
      if (!serverQueue) return;
      if (serverQueue.textChannel) await serverQueue.textChannel.send("Queue deleted").catch(() => {});
      if (serverQueue.voiceChannel) await serverQueue.voiceChannel.leave();
      guild.queue = null;
      guild.musicVariables = null;
    }, 60000)
  } else {
    if (serverQueue.voiceChannel.members.filter(e => !e.user.bot).size < 1 && musicVariables.i === 0) {
      serverQueue.playing = false;
      serverQueue.connection.dispatcher.pause();
      serverQueue.textChannel.send("There's no one on the voice channel! I'm going to remove the queue in 60 seconds!").catch(() => {});
      musicVariables.i = 1;
      musicVariables.time = setTimeout(async () => {
        if (!serverQueue) return;
        if (serverQueue.textChannel) await serverQueue.textChannel.send("Queue deleted").catch(() => {});
        if (serverQueue.voiceChannel) await serverQueue.voiceChannel.leave();
        guild.queue = null;
        guild.musicVariables = null;
      }, 60000)
    }
    if (serverQueue.voiceChannel.members.filter(e => !e.user.bot).size > 0 && musicVariables.i === 1) {
      clearTimeout(musicVariables.time)
      serverQueue.playing = true;
      serverQueue.connection.dispatcher.resume();
      serverQueue.textChannel.send("Okay, I'm back to playing the music.").catch(() => {});
      musicVariables.i = 0;
    }
    if (member.id === bot.user.id) {
      if (newState?.mute && musicVariables.o === 0) {
        serverQueue.playing = false;
        serverQueue.connection.dispatcher.pause();
        serverQueue.textChannel.send("An admin has muted me!").catch(() => {});
        musicVariables.o = 1;
        musicVariables.time1 = setTimeout(async () => {
          if (!serverQueue) return;
          if (serverQueue.textChannel) await serverQueue.textChannel.send("Queue deleted").catch(() => {});
          if (serverQueue.voiceChannel) await serverQueue.voiceChannel.leave();
          guild.queue = null;
          guild.musicVariables = null;
        }, 60000)
      } else if (!newState?.mute && musicVariables.o === 1) {
        clearTimeout(musicVariables.time1)
        if (!serverQueue) return;
        serverQueue.playing = true;
        if (serverQueue.connection && serverQueue.connection.dispatcher) serverQueue.connection.dispatcher.resume();
        if (serverQueue.textChannel) await serverQueue.textChannel.send("Okay, I'm back to playing the music.").catch(() => {});
        musicVariables.o = 0;
      }
    }
  }*/
}