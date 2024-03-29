import Discord from "discord.js";
import parser from 'twemoji-parser';
import ms from "ms";
import pollDb from "../../database/models/poll.js";
import { splitMessage } from '../../extensions.js';

export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Reaction poll system";
    this.deployOptions.options = [
      {
        name: "time",
        description: "How long the poll will last; use 'none' or 'infinity' for no limit.",
        type: 3,
        required: true
      },
      {
        name: "content",
        description: "What do you want to survey?",
        type: 3,
        required: true
      },
      {
        name: "emojis",
        description: "Emojis to replace the default ones",
        type: 3,
        required: false
      },
      {
        name: "embed-url",
        description: "Link to an image to put it on the embed",
        type: 3,
        required: false
      }
    ]
    this.guildonly = true;
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 286784n]
    };
  }
  // eslint-disable-next-line require-await
  async run(bot, interaction) {
    const pre_time = interaction.options.getString("time");
    const time = ["infinite", "infinity", "none"].includes(pre_time?.toLowerCase()) ? Infinity : ms(pre_time);
    if (typeof time !== "number" || time < 60000) return await interaction.reply({ content: "Invalid time! Must be 60 seconds or more.", ephemeral: true });
    let url;
    if (interaction.options.getString("embed-url", false)) {
      try {
        const urlo = new URL(interaction.options.getString("embed-url"));
        if (!(["http:", "https:"].includes(urlo.protocol))) return await interaction.reply({ content: "Invalid image URL!", ephemeral: true });
        url = urlo.href;
      } catch {
        return await interaction.reply({ content: "Invalid image URL!", ephemeral: true });
      }
    }
    const emojis = [];
    const pre_emojis = interaction.options.getString("emojis", false);
    if (pre_emojis) {
      const elist = await interaction.guild.emojis.fetch();
      for (const e of pre_emojis.split(" ")) {
        const emoji = bot.emojis.cache.get(e) ||
          bot.emojis.cache.find(a => a.toString() === e || a.identifier === e) ||
          elist.find(a => a.name === e || a.toString() === e || a.identifier === e) ||
          elist.get(e);
        if (emoji) emojis.push([0, emoji.toString()])
        else {
          const [parsed] = parser.parse(e);
          if (parsed) emojis.push([1, parsed.text]);
        }
      }
      if (!emojis.length) return await interaction.reply({ content: "Invalid emojis!", ephemeral: true });
      if (emojis.length > 20) return await interaction.reply({ content: "You can only put 20 reactions on a message", ephemeral: true });
    } else emojis.push([0, "<:Perfecto:981256609198125056>"], [0, "<:WaldenNo:981256802257756241>"]);

    await interaction.deferReply({ ephemeral: true });
    try {
      let mentions = "";
      const text = interaction.options.getString("content");
      const embed = new Discord.EmbedBuilder()
        .setTitle("Poll")
        .setDescription(splitMessage(text, { max: "4096", char: "" })[0])
        .setFooter({ text: "Made by: " + interaction.user.tag + (time === Infinity ? "" : ", finish date:"), iconURL: interaction.user.displayAvatarURL({}) })
        .setColor("Random");
      if (time !== Infinity) embed.setTimestamp(new Date(Date.now() + time));
      if (url) embed.setImage(url);
      if (interaction.channel.permissionsFor(interaction.user.id).has("MentionEveryone") && interaction.channel.permissionsFor(bot.user.id).has("MentionEveryone")) {
        if (text.includes("@everyone")) mentions += "@everyone ";
        if (text.includes("@here")) mentions += "@here ";
      }
      const poll = await interaction.channel.send({
        content: mentions || undefined,
        embeds: [embed],
        allowedMentions: { parse: (interaction.channel.permissionsFor(interaction.user.id).has("MentionEveryone") ? ["users", "everyone", "roles"] : []) },
      });
      const reactions = [];
      for (const reaction of emojis) reactions.push([reaction[0] ? reaction[1] : null, await poll.react(reaction[1])]);
      try {
        if (time !== Infinity) await pollDb.create({
          guildId: poll.guild.id,
          channelId: poll.channel.id,
          messageId: poll.id,
          date: new Date(Date.now() + time),
          reactions: reactions.map(e => e[0] || e[1].emoji.identifier)
        });
        await interaction.editReply("Done.");
      } catch (err) {
        await interaction.editReply(`Error when creating timed poll: ${err}`);
      }
    } catch (err) {
      await interaction.editReply(`Error when creating poll: ${err}`);
    }
  }
}