module.exports = {
  run: async (bot, message, args) => {
     if (!message.guild)
      return message.channel.send("This command only works on servers.");
    if (!args[1] && !message.attachments.first())
      return message.channel.send("Please enter a file link or upload an attachment");
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send("You need to be in a voice channel to play music!");
    const serverQueue = bot.queue.get(message.guild.id);
    if (serverQueue) return message.channel.send("I'm doing another operation");
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send("I need the permissions to join and speak in your voice channel!");
    }
    if (message.guild.afkChannelID === voiceChannel.id) {
      return message.channel.send("I cannot play music on an AFK channel.");
    }
    let musicVariables = bot.musicVariables1.get(message.guild.id);
    if (musicVariables) return message.channel.send("I'm doing another operation");
    if (!musicVariables) {
      let something = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        loop: false, 
        connection: null,
        other: true,
      };
      bot.musicVariables1.set(message.guild.id, something);
      musicVariables = bot.musicVariables1.get(message.guild.id);
    }
    const file = message.attachments.first() ? message.attachments.first().url : args[1]
    if(!/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/.test(file)) return message.channel.send("Invalid URL!")
    musicVariables.connection = await voiceChannel.join()
    if (musicVariables.connection.voice.mute) {
      setTimeout(async () => {
        await voiceChannel.leave();
      }, 10000);
      message.client.musicVariables1.delete(message.guild.id);
      message.channel.stopTyping();
      return message.channel.send("Sorry, but I'm muted. Contact an admin to unmute me.");
    }
    playFile(file, message.guild);
  },
  aliases: [],
  description: "Play a real audio file"
};

async function playFile(file, guild) {
  const musicVariables = guild.client.musicVariables1.get(guild.id);
  const dispatcher = await musicVariables.connection.play(file, { highWaterMark: 1 << 25 });
  dispatcher.on("finish", async () => {
    if(!musicVariables.loop) {
      await musicVariables.voiceChannel.leave();
      guild.client.musicVariables1.delete(guild.id);
    } else {
      playFile(file, guild);
    }
  });
  dispatcher.on("close", async () => {
    if (!musicVariables.loop) {
      await musicVariables.voiceChannel.leave();
      guild.client.musicVariables1.delete(guild.id);
    } else {
      playFile(file, guild);
    }
  });
  dispatcher.on("error", async err => {
    await musicVariables.voiceChannel.leave();
    guild.client.musicVariables1.delete(guild.id);
    message.channel.send("Some error ocurred! Here's a debug: ")
  });
  dispatcher.on("start", async () => {
    if (musicVariables.loop) return;
    musicVariables.textChannel.send("Don't worry if the music starts to sound weird at first. Unfortunately I had to set up a workaround so that the music doesn't stop too soon.\nhttps://github.com/discordjs/discord.js/issues/3362").then(m => { m.suppressEmbeds(); m.delete({ timeout: 10000 }) });
  });
}