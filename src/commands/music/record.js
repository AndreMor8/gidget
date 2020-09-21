import Command from '../../utils/command.js';
import Discord from 'discord.js';
import { Readable } from 'stream';
import cosaparaelmp3 from "node-lame";
const SILENCE_FRAME = Buffer.from([0xF8, 0xFF, 0xFE]);
class Silence extends Readable {
  _read() {
    this.push(SILENCE_FRAME);
  }
}
export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "I'm going to record your voice (experimental)";
    this.guildonly = true;
  }
  async run(message, args) {
    if (!message.member.voice.channel) return message.channel.send("You have to be in a voice channel!");
    if (!args[1]) return message.channel.send("`dm` to send the file to your direct messages, `play` to play it on the voice channel, `server` to send the file to this channel.");
    let options = {}
    if (["dm", "server"].includes(args[1].toLowerCase())) {
      options = { mode: "pcm" }
    } else if (args[1].toLowerCase() !== "play") return message.channel.send("`dm` to send the file to your direct messages, `play` to play it on the voice channel, `server` to send the file to this channel.");
    const serverQueue = message.guild.queue;
    if (serverQueue && serverQueue.inseek) return;
    let musicVariables = message.guild.musicVariables;
    if (serverQueue || musicVariables) return message.channel.send("I'm doing another operation.");
    if (musicVariables && musicVariables.other) return message.channel.send("I'm doing another operation");
    message.guild.musicVariables = { other: true };
    musicVariables = message.guild.musicVariables;
    const voiceChannel = message.member.voice.channel;
    voiceChannel.join().then(async (connection) => {
      await connection.play(new Silence(), { type: "opus" });
      await message.channel.send('Start talking. I will record **what you say** until you finish speaking.');
      const audio = connection.receiver.createStream(message.author, options);
      let col = message.channel.createMessageCollector((m) => m.author.id === message.author.id && m.content.toLowerCase() === "stop");
      col.on("collect", () => {
        col.stop();
        audio.destroy();
        voiceChannel.leave()
        message.guild.musicVariables = null;
      });
      let i = 0;
      let o = 0;
      connection.on("speaking", async (user, speaking) => {
        if (user.id !== message.author.id) return;
        if (speaking.has("SPEAKING") && i < 1) {
          i++
          col.stop();
          await message.channel.send('I\'m listening to you. Stop talking to give you the recording.');
        } else if (i > 0 && o < 1) {
          o++
          if (args[1] === "play") {
            const dispatcher = connection.play(audio, { type: "opus" })
            dispatcher.on("start", () => {
              message.channel.send("I'm playing your recording.").catch(err => { });
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
              message.channel.send("Some error ocurred in the dispatcher! Here's a debug: " + err).catch(err => { });
              message.guild.musicVariables = null;
            })
          } else {
            message.channel.startTyping();
            let chunks = [];
            audio.on("data", (c) => {
              chunks.push(c);
            });
            audio.on("end", () => {
              let buf = Buffer.concat(chunks);
              const encoder = new cosaparaelmp3.Lame({
                "output": "buffer",
                "bitrate": 192,
                "raw": true,
                "sfreq": 48,
                "bitwidth": 16,
                "signed": true,
                "little-endian": true,
              }).setBuffer(buf);
              encoder.encode().then(async res => {
                const buf = res.getBuffer();
                const attachment = new Discord.MessageAttachment(buf, 'audio.mp3');
                if (args[1] === "server") await message.channel.send("Here's your recording.", attachment).catch(err => {
                  if (err.code === 40005) message.channel.send("The file is very large. I can't send you that.").catch(err => { });
                });
                else await message.member.send("Here's your recording.", attachment).catch(err => {
                  switch (err.code) {
                    case 40005:
                      message.channel.send("The file is very large. I can't send you that.").catch(err => { });
                      break;
                    case 50007:
                      message.channel.send("I can't send you DMs :(").catch(err => { });
                      break;
                    default:
                      console.log(err);
                      message.channel.send("Error when sending the file: " + err).catch(err => { });
                  }
                });
              }).catch(async err => {
                await message.channel.send("Error when converting the PCM buffer: " + err).catch(err => { });
              }).finally(() => {
                voiceChannel.leave();
                message.channel.stopTyping(true);
                message.guild.musicVariables = null;
              });
            })
          }
        }
      });
    });
  }
}
