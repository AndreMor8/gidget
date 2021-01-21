import fetch from 'node-fetch';
import ytdl from 'discord-ytdl-core';
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = [];
    this.description = "Play a real audio file";
    this.guildonly = true;
    this.permissions = {
      user: [0, 0],
      bot: [0, 0]
    };
  }
  async run(bot, message, args) {
    if (!args[1] && !message.attachments.first())
      return message.channel.send("Please enter a file link or upload an attachment");
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send("You need to be in a voice channel to play music!");
    const serverQueue = message.guild.queue
    if (serverQueue) return message.channel.send("I'm doing another operation");
    const permissions = voiceChannel.permissionsFor(bot.user.id);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send("I need the permissions to join and speak in your voice channel!");
    }
    if (message.guild.afkChannelID === voiceChannel.id) {
      return message.channel.send("I cannot play music on an AFK channel.");
    }
    const file = message.attachments.first() ? message.attachments.first().url : args[1]
    if (!/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)/.test(file)) return message.channel.send("Invalid URL!");
    const res = await fetch(file);
    if (!res.ok) return message.channel.send("Error: Status code returned " + res.status + " (" + res.statusText + ")");
    let musicVariables = message.guild.musicVariables;
    if (musicVariables) return message.channel.send("I'm doing another operation");
    if (!musicVariables) {
      message.guild.musicVariables = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        loop: false,
        connection: null,
        other: true,
        readyForLoop: false
      };

      musicVariables = message.guild.musicVariables
    }
    musicVariables.connection = await voiceChannel.join();
    if (musicVariables.connection.voice.mute) {
      setTimeout(async () => {
        await voiceChannel.leave();
      }, 10000);
      message.guild.musicVariables = null;
      message.channel.stopTyping();
      return message.channel.send("Sorry, but I'm muted. Contact an admin to unmute me.");
    }
    await playFile(file, message.guild);
  }
}

async function playFile(file, guild) {
  const musicVariables = guild.musicVariables;
  try {
    // eslint-disable-next-line no-var
    var timeout;
    const pre_stream = await fetch(file);
    if (!pre_stream.ok) {
      await musicVariables.voiceChannel.leave();
      guild.musicVariables = null;
      return;
    }
    const stream = ytdl.arbitraryStream(pre_stream.body, { opusEncoded: true });
    const dispatcher = await musicVariables.connection.play(stream, { type: "opus" });
    dispatcher.on("finish", async () => {
      clearTimeout(timeout);
      if (!musicVariables.loop) {
        await musicVariables.voiceChannel.leave();
        guild.musicVariables = null;
      } else {
        playFile(file, guild);
      }
    });
    dispatcher.on("close", async () => {
      if (!guild.me.voice.channel) {
        clearTimeout(timeout);
        await musicVariables.voiceChannel.leave();
        guild.musicVariables = null;
      }
    });
    dispatcher.on("error", async err => {
      clearTimeout(timeout);
      await musicVariables.voiceChannel.leave();
      guild.musicVariables = null;
      await musicVariables.textChannel.send("Some error ocurred! Here's a debug: " + err)
    });
    dispatcher.on("start", () => {
      if (musicVariables.readyForLoop) return;
      else {
        timeout = setTimeout(() => {
          guild.musicVariables.readyForLoop = true;
        }, 60000);
      }
      /*if (musicVariables.loop) return;
      musicVariables.textChannel.send("Don't worry if the music starts to sound weird at first. Unfortunately I had to set up a workaround so that the music doesn't stop too soon.\nhttps://github.com/discordjs/discord.js/issues/3362").then(m => { m.suppressEmbeds(); m.delete({ timeout: 10000 }) });*/
    });
  } catch (err) {
    await musicVariables.voiceChannel.leave();
    guild.musicVariables = null;
    await musicVariables.textChannel.send("Some error ocurred! Here's a debug: " + err)
  }
}
