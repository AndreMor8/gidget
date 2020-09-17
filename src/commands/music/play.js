const COOKIE = require('fs').readFileSync(require('path').join(__dirname, "/../../../cookies.txt"), "utf-8");
const ytdl = require("discord-ytdl-core");
const ytsr = require("ytsr");
const ytpl = require("ytpl");
const moment = require("moment");
const { url } = require('inspector');
const Discord = require('discord.js');
const times = require('../../utils/times');
require("moment-duration-format");
module.exports = {
  run: async (bot, message, args, seek) => {
    if (!args[1])
      return message.channel.send("Please enter a YouTube link or search term.");
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send(
        "You need to be in a voice channel to play music!"
      );
    const serverQueue = message.guild.queue;
    if (serverQueue) {
      if (serverQueue.voiceChannel.id !== voiceChannel.id)
        return message.channel.send(
          "I'm on another voice channel! I cannot be on two channels at the same time."
        );
    }
    const permissions = voiceChannel.permissionsFor(bot.user.id);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
    }
    if (message.guild.afkChannelID === voiceChannel.id) {
      return message.channel.send("I cannot play music on an AFK channel.");
    }
    let musicVariables = message.guild.musicVariables
    if (musicVariables && musicVariables.other)
      return message.channel.send("I'm doing another operation");
    if (!musicVariables) {
      message.guild.musicVariables = {
        perror: 0,
        inp: 0,
        py: 0,
        memberVoted: [],
        i: 0,
        o: 0,
        time: null,
        time1: null,
        other: false
      };
      musicVariables = message.guild.musicVariables
    }
    if (musicVariables.inp == 1) return message.channel.send("I'm catching your playlist. Hang on!");

    if (typeof seek === "number") {
      return await play(message.guild, serverQueue.songs[0], seek)
    } else if (ytdl.validateURL(args[1])) {
      if (serverQueue) {
        if (serverQueue.loop) {
          serverQueue.loop = false;
          message.channel.send("🔁 The song repeat has been disabled.");
        }
      }
      message.channel.startTyping();
      return handleServerQueue(serverQueue, message.channel, voiceChannel, [{ url: args[1], handle: true }]).catch(err => {
        message.channel.send("Error: " + err);
      });
    } else if (ytdl.validateID(args[1])) {
      if (serverQueue) {
        if (serverQueue.loop) {
          serverQueue.loop = false;
          message.channel.send("🔁 The song repeat has been disabled.");
        }
      }
      message.channel.startTyping();
      return handleServerQueue(serverQueue, message.channel, voiceChannel, [{ url: "https://www.youtube.com/watch?v=" + args[1], handle: true }]).catch(err => {
        message.channel.send("Error: " + err);
      });;
    } else if (ytpl.validateID(args[1])) {
      let form1 = await message.channel.send("Hang on! <:WaldenRead:665434370022178837>");
      message.channel.startTyping();
      try {
        const playlist = await ytpl(args[1]);
        const videos = playlist.items;
        message.channel.startTyping(playlist.items.length - 1);
        musicVariables.inp = 1;
        if (serverQueue) {
          if (serverQueue.loop) {
            serverQueue.loop = false;
            message.channel.send("🔁 The song repeat has been disabled.");
          }
        }
        let songs = Object.values(videos).map(e => {
          return {
            url: e.url_simple,
            title: e.title,
            duration: times(e.duration) / 1000,
            seektime: 0,
            age_restricted: false
          }
        });
        await handleServerQueue(serverQueue, message.channel, voiceChannel, songs, true)
        message.channel.stopTyping(true);
        message.channel.send(`Playlist: **${playlist.title}** has been added to the queue (${playlist.items.length} songs)!`)          
      } catch (err) {
        if (!serverQueue) message.guild.musicVariables = null;
        message.channel.stopTyping(true);
        message.channel.send("I couldn't queue your playlist. Here's a debug: " + err)
        .then(m => form1.delete()).catch(err => {});
      }
    } else {
      let filter;
      try {
        message.channel.startTyping();
        const filters = await ytsr.getFilters(args.slice(1).join(" "));
        filter = filters.get("Type").find(o => o.name === "Video");
        let options = {
          safeSearch: true,
          limit: 1,
          nextpageRef: filter.ref
        };
        const searchResults = await ytsr(null, options);
        if (serverQueue) {
          if (serverQueue.loop) {
            serverQueue.loop = false;
            message.channel.send("🔁 The song repeat has been disabled.");
          }
        }
        if (!searchResults) {
          message.channel.stopTyping(true);
          return message.reply(
            `I didn't find any video. Check your term and try again.`
          );
        }
        if (!searchResults.items[0]) {
          message.channel.stopTyping(true);
          return message.reply(
            `I didn't find any video. Check your term and try again.`
          );
        }
        await handleServerQueue(serverQueue, message.channel, voiceChannel, [{ url: searchResults.items[0].link, title: searchResults.items[0].title, duration: times(searchResults.items[0].duration) / 1000, seektime: 0, age_restricted: false }]);
      } catch (err) {
        if (!serverQueue) message.guild.musicVariables = null;
        message.channel.stopTyping(true);
        message.channel.send("Some error ocurred. Here's a debug: " + err);
      }
    }
  },
  aliases: ["join"],
  description: "Play music from YouTube",
  guildonly: true,
  permissions: {
    user: [0, 0],
    bot: [0, 0]
  }
};

/**
 * Get the necessary YouTube video info. Don't use this if another API is helping you on that.
 * @param {String} URL The YouTube video URL.
 * @returns {Object} The video object ready to push to the queue.
 */
async function handleVideo(URL) {
  const songInfo = await ytdl.getBasicInfo(URL, {
    requestOptions: {
      headers: {
        cookie: COOKIE
      },
    },
  });
  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
    duration: songInfo.videoDetails.lengthSeconds,
    seektime: 0,
    age_restricted: songInfo.videoDetails.age_restricted,
  };
  return song;
}

/**
 * 
 * @param {Object} serverQueue 
 * @param {Discord.TextChannel} textChannel 
 * @param {Discord.VoiceChannel} voiceChannel 
 * @param {Object[]} songs 
 * @param {Boolean} playlist
 * @returns {Promise<void>}
 */
async function handleServerQueue(serverQueue, textChannel, voiceChannel, pre_songs, playlist = false) {
  const musicVariables = voiceChannel.guild.musicVariables;
  const songs = [];
  for (const pre_song of pre_songs) {
    let song = pre_song
    if (pre_song.handle) {
      song = await handleVideo(pre_song.url);
    }
    if (song.age_restricted && !textChannel.nsfw) {
      if (!playlist) {
        textChannel.send("To listen to inappropriate content ask for this video on an NSFW channel.");
        return;
      }
      else continue;
    }
    songs.push(song);
  }
  if (!serverQueue) {
    const queueConstruct = {
      textChannel: textChannel,
      voiceChannel: voiceChannel,
      connection: null,
      songs,
      volume: 5,
      playing: true,
      loop: false,
      inseek: false,
    };

    voiceChannel.guild.queue = queueConstruct;

    try {
      let connection = await voiceChannel.join();
      if (connection.voice.mute) {
        setTimeout(() => {
          voiceChannel.leave();
        }, 10000);
        connection.channel.guild.queue = null;;
        connection.channel.guild.musicVariables = null;
        textChannel.stopTyping();
        textChannel.send("Sorry, but I'm muted. Contact an admin to unmute me.");
        return;
      }
      queueConstruct.connection = connection;
      musicVariables.py = 1;
      await play(connection.channel.guild, queueConstruct.songs[0]);
      textChannel.stopTyping();
    } catch (error) {
      console.error(error);
      voiceChannel.leave();
      voiceChannel.guild.queue = null;
      voiceChannel.guild.musicVariables = null;
      textChannel.stopTyping();
      textChannel.send("I could not join the voice channel. To prevent the bot from turning off the queue has been removed. Here's a debug: " + error);
      return;
    }
  } else {
    for (const s of songs) {
      serverQueue.songs.push(s);
    }
    if (!playlist) {
      textChannel.stopTyping();
      textChannel.send(`**${songs[0].title}** has been added to the queue!`);
    }
  }
  return;
}

async function play(guild, song, seek = 0) {
  const serverQueue = guild.queue;

  const musicVariables = guild.musicVariables;

  if (!song) {
    if (serverQueue) {
      if (serverQueue.textChannel) {
        serverQueue.textChannel.stopTyping();
      }
      if (serverQueue.voiceChannel) {
        serverQueue.voiceChannel.leave();
      }
    }
    guild.queue = null;
    guild.musicVariables = null;
    return;
  }
  try {
    const dispatcher = serverQueue.connection.play(ytdl(song.url, {
      opusEncoded: true,
      seek: seek,
      filter: "audioonly",
      highWaterMark: 1 << 25
    }), { type: "opus" });
    dispatcher.on("start", async () => {
      dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
      if (serverQueue.inseek) {
        serverQueue.inseek = false
        serverQueue.textChannel.stopTyping();
        return serverQueue.textChannel.send("Position moved to " + moment.duration(seek, "seconds").format());
      };
      if (!serverQueue.loop)
        serverQueue.textChannel.send(
          `<:JukeboxRobot:610310184484732959> Now playings: **${song.title}**`
        );
      serverQueue.textChannel.stopTyping(true);
    });
    dispatcher.on("finish", async () => {
      if (serverQueue.inseek) return;
      musicVariables.memberVoted = [];
      if (!serverQueue.loop) serverQueue.songs.shift();
      if (!serverQueue.playing) serverQueue.playing = true;
      await play(guild, serverQueue.songs[0]);
    });
    dispatcher.on("close", async () => {
      if (serverQueue.inseek) return;
      if (!guild.me.voice.channel) {
        clearTimeout(musicVariables.time);
        if (serverQueue.textChannel) {
          serverQueue.textChannel.stopTyping();
        }
        if (serverQueue.voiceChannel) {
          serverQueue.voiceChannel.leave();
        }
        guild.queue = null;
        guild.musicVariables = null;
        return;
      }
    });
    dispatcher.on("error", async err => {
      musicVariables.memberVoted = [];
      serverQueue.songs.shift();
      await serverQueue.textChannel
        .send("An error occurred with the dispatcher. Here's a debug: " + err)
        .catch(err => console.log(err));
      if (!serverQueue.playing) serverQueue.playing = true;
      await play(guild, serverQueue.songs[0]);
    });
  } catch (err) {
    console.log(err);
    musicVariables.memberVoted = [];
    serverQueue.songs.shift();
    if (serverQueue.textChannel) {
      serverQueue.textChannel.stopTyping();
      await serverQueue.textChannel
        .send("An error occurred. Here's a debug: " + err)
        .catch(err => console.log(err));
    }
    if (!serverQueue.playing) serverQueue.playing = true;
    await play(guild, serverQueue.songs[0]);
  }
}