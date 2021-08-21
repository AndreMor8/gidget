import ytdl from "@distube/ytdl-core";
import { isURL } from 'distube';
import ytpl from "@distube/ytpl";
import { MessageEmbed, MessageButton, MessageActionRow } from "discord.js";
export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Browse videos to select which will be to play.";
    this.deployOptions.options = [{
      name: "term",
      description: "What am I going to look for?",
      type: "STRING",
      required: true
    }]
    this.guildonly = true;
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 0n]
    };
  }
  async run(bot, interaction) {
    const channel = interaction.member.voice.channel;
    if (!channel) return interaction.reply("You need to be in a voice channel to play music!");
    const queue = bot.distube.getQueue(interaction.guild.me.voice);
    if (queue && queue.voiceChannel.id !== channel.id) return interaction.reply("You are not on the same voice channel as me.");
    const tosearch = interaction.options.getString("term", true);
    if (tosearch > 200) return interaction.reply("The maximum size of the search term is 200 characters.");
    if (isURL(tosearch)) return interaction.reply("YouTube links should go in the `play` command");
    if (ytdl.validateID(tosearch) || ytpl.validateID(tosearch)) return interaction.reply("YouTube IDs should go in the `play` command");
    try {
      await interaction.deferReply();
      const videos = await bot.distube.search(tosearch, { safeSearch: !interaction.channel.nsfw });
      if (!videos.length) return interaction.editReply("I didn't find any video. Please try again with another term.");
      let text = '';
      const buttons = [];
      let i = 0;
      for (const elements of videos) {
        if (text.length < 1750 && i !== 10) {
          text += `${i + 1}. **${elements.name}**\n${elements.type === "playlist" ? "Type: Playlist" : `Duration: ${elements.formattedDuration}`}\n\n`;
          buttons.push(new MessageButton().setStyle("PRIMARY").setCustomId(`ps_func_${i + 1}`).setLabel((i + 1).toString()));
        } else break;
        i++;
      }
      const stopButton = new MessageButton()
        .setStyle("DANGER")
        .setCustomId("ps_func_stop")
        .setLabel("Stop");
      const embed = new MessageEmbed()
        .setTitle(`Search results for ${tosearch}`)
        .setDescription(text)
        .setFooter(i + " results, press the corresponding button to play that song, you can press \"Stop\" to stop selecting")
        .setColor("RANDOM")
        .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true }))

      const msg = await interaction.editReply({ content: null, embeds: [embed], components: [new MessageActionRow().addComponents([buttons[0], buttons[1], buttons[2], buttons[3], buttons[4]]), new MessageActionRow().addComponents([buttons[5], buttons[6], buttons[7], buttons[8], buttons[9]]), new MessageActionRow().addComponents([stopButton])] });
      const collector = msg.createMessageComponentCollector({ filter: b => b.user.id === interaction.user.id, time: 35000, idle: 15000 })

      collector.on("collect", async button => {
        const number = parseInt(button.customId.split("_")[2]);
        if (!isNaN(number)) {
          await button.deferReply();
          if (!msg.deleted) await interaction.editReply({ content: "Selected.", embeds: [], components: [] });
          collector.stop("Ok!");
          await bot.slashCommands.get(`play`).run(bot, button, videos[number - 1]);
        } else if (button.customId === "ps_func_stop") {
          if (!msg.deleted) await button.update({ content: "Well, looks like you don't want to listen music.", embeds: [], components: [] });
          collector.stop("manual");
        }
      });
      collector.on("end", (collected, reason) => {
        if (reason === "Ok!") return;
        else if (reason === "idle" || reason === "time") {
          if (!msg.deleted) interaction.editReply("Time's up! Run this command again...");
        }
      })

    } catch (err) {
      console.error(err);
      interaction.editReply("Some error ocurred. Here's a debug: " + err);
    }
  }
}