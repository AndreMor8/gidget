module.exports = async (bot, oldState, newState) => {
  const musicVariables = bot.musicVariables1.get(newState.guild.id);
  if(musicVariables && !newState.channel && (newState.member.id === bot.user.id)) {
    bot.queue.delete(newState.guild.id)
    bot.musicVariables1.delete(newState.guild.id)
  }
  const serverQueue = bot.queue.get(newState.guild.id);
  if(!serverQueue) return;
  if(!serverQueue.voiceChannel || !serverQueue.textChannel) return;
  if(!musicVariables) return;
  if (newState.member.id === bot.user.id && serverQueue.voiceChannel.id !== newState.channelID) {
    serverQueue.voiceChannel = newState.channel;
    serverQueue.playing = false;
    serverQueue.connection.dispatcher.pause();
    musicVariables.i = 1;
    musicVariables.time = setTimeout(async () => {
      if(!serverQueue) return;
      if(serverQueue.textChannel) await serverQueue.textChannel.send("Queue deleted")
      if(serverQueue.voiceChannel) await serverQueue.voiceChannel.leave();
      bot.queue.delete(newState.guild.id)
      bot.musicVariables1.delete(newState.guild.id)
    }, 60000)
  } else {
    if(serverQueue.voiceChannel.members.size < 2 && musicVariables.i === 0) {
    serverQueue.playing = false;
    serverQueue.connection.dispatcher.pause();
    serverQueue.textChannel.send("There's no one on the voice channel! I'm going to remove the queue in 60 seconds!")
    musicVariables.i = 1;
    musicVariables.time = setTimeout(async () => {
      if(!serverQueue) return;
      if(serverQueue.textChannel) await serverQueue.textChannel.send("Queue deleted")
      if(serverQueue.voiceChannel) await serverQueue.voiceChannel.leave();
      bot.queue.delete(newState.guild.id)
      bot.musicVariables1.delete(newState.guild.id)
    }, 60000)
  }
  if(serverQueue.voiceChannel.members.size > 1 && musicVariables.i === 1) {
    clearTimeout(musicVariables.time)
    serverQueue.playing = true;
    serverQueue.connection.dispatcher.resume();
    serverQueue.textChannel.send("Okay, I'm back to playing the music.")
    musicVariables.i = 0;
  };
  if(newState.member.id === bot.user.id) {
      if(newState.mute && musicVariables.o === 0) {
        serverQueue.playing = false;
        serverQueue.connection.dispatcher.pause();
        serverQueue.textChannel.send("An admin has muted me!")
        musicVariables.o = 1;
        musicVariables.time1 = setTimeout(async () => {
          if(!serverQueue) return;
      if(serverQueue.textChannel) await serverQueue.textChannel.send("Queue deleted")
      if(serverQueue.voiceChannel) await serverQueue.voiceChannel.leave();
      bot.queue.delete(newState.guild.id)
      bot.musicVariables1.delete(newState.guild.id)
    }, 60000)
      } else if (!newState.mute && musicVariables.o === 1) {
        clearTimeout(musicVariables.time1)
        if(!serverQueue) return;
        serverQueue.playing = true;
        if(serverQueue.connection && serverQueue.connection.dispatcher) serverQueue.connection.dispatcher.resume();
        if(serverQueue.textChannel) await serverQueue.textChannel.send("Okay, I'm back to playing the music.")
        musicVariables.o = 0;
      }
  }
  }
}