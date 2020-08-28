const Discord = require('discord.js')
const { Readable } = require('stream');

module.exports = {
  run: async (bot, message, args) => {
    if(!args[1]) return message.channel.send("`dm` to send the file to your direct messages, `play` to play it on the voice channel, `server` to send the file to this channel.");
    let options = {}
    if(args[1] === "dm" || args[1] === "server") {
      options = { mode: "pcm" }
    } else if(args[1] !== "play") return message.channel.send("`dm` to send the file to your direct messages, `play` to play it on the voice channel, `server` to send the file to this channel.");
    const serverQueue = message.guild.queue
    if (serverQueue && serverQueue.inseek) return;
    let musicVariables = message.guild.musicVariables;
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to pause the music!"
      );
    if (serverQueue || musicVariables) {
      return message.channel.send(
        "I am doing another operation."
      );
    }
    if (musicVariables && musicVariables.other) return message.channel.send("I'm doing another operation");
    const SILENCE_FRAME = Buffer.from([0xF8, 0xFF, 0xFE]);
    message.guild.musicVariables = { other: true };
    musicVariables = message.guild.musicVariables;
    class Silence extends Readable {
      _read() {
        this.push(SILENCE_FRAME);
      }
    }
    const voiceChannel = message.member.voice.channel;
    voiceChannel.join().then(async (connection) => {
      await connection.play(new Silence(), { type: "opus" });
      await message.channel.send('Start talking. I will record **what you say** until you finish speaking.');
      const audio = connection.receiver.createStream(message.author, options);
      let i = 0;
      let o = 0;
      connection.on("speaking", async (user, speaking) => {
        if(user.id !== message.author.id) return;
        if (speaking.has("SPEAKING") && i < 1) {
          i++
          await message.channel.send('I am listening to you. Stop talking to give you the recording.');
        } else if(i > 0 && o < 1) {
          o++
          if(args[1] === "play") {
            const dispatcher = connection.play(audio, { type: "opus" })
            dispatcher.on("start", () => {
              message.channel.send("I'm playing your audio.");
            })
            dispatcher.on("finish", async () => {
              await voiceChannel.leave();
              message.guild.musicVariables = null;
            })
            dispatcher.on("close", () => {
              message.guild.musicVariables = null;
            })
            dispatcher.on("error", async (err) => {
              await voiceChannel.leave();
              message.channel.send("Some error ocurred! Here's a debug: " + err);
              message.guild.musicVariables = null;
            })
          } else {
            const attachment = new Discord.MessageAttachment(audio, 'audio.pcm');
            if(args[1] === "server") await message.channel.send("Here's your recording. You must pass it to Audacity as raw data to listen to it.", attachment);
            else await message.member.send("Here's your recording. You must pass it to Audacity as raw data to listen to it.", attachment);
            await voiceChannel.leave();
            message.guild.musicVariables = null;
          }
        }
      });
    });
  },
  aliases: [],
  description: "I'm going to record your voice (experimental)",
  guildonly: true,
  permissions: {
    user: [0, 0],
    bot: [0, 0]
  }
};
