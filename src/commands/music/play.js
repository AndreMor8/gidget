const ytdl = require("ytdl-core");
const ytsr = require("ytsr");
const ytpl = require("ytpl");
const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
module.exports = {
  run: async (bot, message, args, seek) => {
    let ytlink = "";
    if (!message.guild)
      return message.channel.send("This command only works on servers.");
    if (!args[1])
      return message.channel.send(
        "Please enter a YouTube link or search term."
      );
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send(
        "You need to be in a voice channel to play music!"
      );
    const serverQueue = bot.queue.get(message.guild.id);
    if (serverQueue) {
      if (serverQueue.voiceChannel.id !== voiceChannel.id)
        return message.channel.send(
          "I'm on another voice channel! I cannot be on two channels at the same time."
        );
    }
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
    }
    if (message.guild.afkChannelID === voiceChannel.id) {
      return message.channel.send("I cannot play music on an AFK channel.");
    }
    let musicVariables = bot.musicVariables1.get(message.guild.id);
    if (musicVariables && musicVariables.other)
      return message.channel.send("I'm doing another operation");
    if (!musicVariables) {
      let something = {
        merror: 0,
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
      bot.musicVariables1.set(message.guild.id, something);
      musicVariables = bot.musicVariables1.get(message.guild.id);
    }
    if (musicVariables.inp == 1) return message.channel.send("I'm catching your playlist. Hang on!");

    if(typeof seek === "number") {
      return await play(message.guild, serverQueue.songs[0], seek)
    } else if (ytdl.validateURL(args[1])) {
      ytlink = args[1];
      if (serverQueue) {
        if (serverQueue.loop) {
          serverQueue.loop = false;
          message.channel.send("🔁 The song repeat has been disabled.");
        }
      }
      message.channel.startTyping();
      return handleVideo(message, voiceChannel);
    } else if (ytdl.validateID(args[1])) {
      if (serverQueue) {
        if (serverQueue.loop) {
          serverQueue.loop = false;
          message.channel.send("🔁 The song repeat has been disabled.");
        }
      }
      ytlink = "https://www.youtube.com/watch?v=" + args[1];
      message.channel.startTyping();
      return handleVideo(message, voiceChannel);
    } else if (ytpl.validateURL(args[1])) {
      let form1 = await message.channel.send(
        "Hang on! <:WaldenRead:665434370022178837>"
      );
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
        for (const video of Object.values(videos)) {
          ytlink = video.url_simple;
          await handleVideo(message, voiceChannel, true).catch(error =>
            console.log(error)
          );
        }
        if (musicVariables.inp == 1) {
          musicVariables.inp = 0;
          musicVariables.perror = 0;
          message.channel.stopTyping(true);
          message.channel
            .send(
              `Playlist: **${playlist.title}** has been added to the queue (${playlist.items.length} songs)!`
            )
            .then(m => form1.delete());
        } else {
          musicVariables.inp = 0;
          musicVariables.perror = 0;
          message.channel.stopTyping(true);
          message.channel
            .send("I couldn't queue your playlist.")
            .then(m => form1.delete());
        }
      } catch (err) {
        if (!serverQueue) bot.musicVariables1.delete(message.guild.id);
        message.channel.stopTyping(true);
        message.channel.send("Some error ocurred. Here's a debug: " + err);
      }
    } else {
      let filter;
      try {
        message.channel.startTyping();
        const filters = await ytsr.getFilters(args.slice(1).join(" "));
        filter = filters.get("Type").find(o => o.name === "Video");
        let options = {
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
        ytlink = searchResults.items[0].link;
        return handleVideo(message, voiceChannel);
      } catch (err) {
        if (!serverQueue) bot.musicVariables1.delete(message.guild.id);
        message.channel.stopTyping(true);
        message.channel.send("Some error ocurred. Here's a debug: " + err);
      }
    }
  },
  aliases: [],
  description: "Play music from YouTube"
};

async function handleVideo(message, voiceChannel, playlist = false) {
  const serverQueue = message.client.queue.get(message.guild.id);

  const musicVariables = message.client.musicVariables1.get(message.guild.id);
  const songInfo = await ytdl
    .getInfo(ytlink)
    .catch(err => {
      console.log(err);
      musicVariables.merror = 1;
    });
  if (musicVariables.merror == 1) {
    message.channel.stopTyping(true);
    musicVariables.merror = 0;
    if (playlist && musicVariables.perror == 0) {
      musicVariables.perror = 1;
      return message.reply(`I couldn't catch all the videos.`);
    } else if (!playlist) {
      return message.reply("something bad happened. Try again!");
    } else {
      return;
    }
  } else {
    const song = {
      title: songInfo.title,
      url: songInfo.video_url,
      duration: songInfo.length_seconds,
      seektime: 0,
    };

    if (!serverQueue) {
      const queueConstruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
        loop: false,
        inseek: false,
      };
      message.client.queue.set(message.guild.id, queueConstruct);

      queueConstruct.songs.push(song);

      try {
        let connection = await voiceChannel.join();
        if (connection.voice.mute) {
          setTimeout(async () => {
            await voiceChannel.leave();
          }, 10000);
          message.client.queue.delete(message.guild.id);
          message.client.musicVariables1.delete(message.guild.id);
          message.channel.stopTyping();
          return message.channel.send(
            "Sorry, but I'm muted. Contact an admin to unmute me."
          );
        }
        queueConstruct.connection = connection;
        musicVariables.py = 1;
        await play(message.guild, queueConstruct.songs[0]);
        message.channel.stopTyping();
      } catch (error) {
        console.error(error);
        await voiceChannel.leave();
        message.client.queue.delete(message.guild.id);
        message.client.musicVariables1.delete(message.guild.id);
        message.channel.stopTyping();
        return message.channel.send(
          "I could not join the voice channel. To prevent the bot from turning off the queue has been removed. Here's a debug: " +
            error
        );
      }
    } else {
      serverQueue.songs.push(song);
      if (playlist) return;
      else {
        message.channel.stopTyping();
        return message.channel.send(
          `**${song.title}** has been added to the queue!`
        );
      }
    }
    return;
  }
}
async function play(guild, song, seek = 0) {
  const serverQueue = guild.client.queue.get(guild.id);

  const musicVariables = guild.client.musicVariables1.get(guild.id);

  if (!song) {
    if(serverQueue) {
      if (serverQueue.textChannel) {
      serverQueue.textChannel.stopTyping();
    }
    if (serverQueue.voiceChannel) {
      serverQueue.voiceChannel.leave();
    }
    }
    guild.client.queue.delete(guild.id);
    guild.client.musicVariables1.delete(guild.id);
    return;
  }
  try {
    const dispatcher = serverQueue.connection.play(ytdl(song.url, { type: "audioonly", highWaterMark: 1 << 25 }), { seek: seek });
    dispatcher.on("start", async () => {
      if (serverQueue.inseek) {
        serverQueue.inseek = false
        serverQueue.textChannel.stopTyping();
        return serverQueue.textChannel.send("Position moved to " + moment.duration(seek, "seconds").format());
      };
      dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
      if (!serverQueue.loop)
        serverQueue.textChannel.send(
          `<:JukeboxRobot:610310184484732959> Now playing: **${song.title}**`
        );
      serverQueue.textChannel.stopTyping();
    });
    dispatcher.on("finish", async () => {
      if(serverQueue.inseek) return;
      musicVariables.memberVoted = [];
      if (!serverQueue.loop) serverQueue.songs.shift();
      if (!serverQueue.playing) serverQueue.playing = true;
      await play(guild, serverQueue.songs[0]);
    });
    dispatcher.on("close", async () => {
      if (serverQueue.inseek) return;
      if(!guild.me.voice.channel) {
        clearTimeout(musicVariables.time);
        if (serverQueue.textChannel) {
          serverQueue.textChannel.stopTyping();
        }
        if (serverQueue.voiceChannel) {
          serverQueue.voiceChannel.leave();
        }
        guild.client.queue.delete(guild.id);
        guild.client.musicVariables1.delete(guild.id);
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
    if(serverQueue.textChannel) {
      serverQueue.textChannel.stopTyping();
      await serverQueue.textChannel
      .send("An error occurred. Here's a debug: " + err)
      .catch(err => console.log(err));
    }
    if (!serverQueue.playing) serverQueue.playing = true;
    await play(guild, serverQueue.songs[0]);
  }
}
