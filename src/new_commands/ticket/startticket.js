import Discord from "discord.js";
import ticket from "../../database/models/ticket.js";

export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Start listening tickets";
    this.deployOptions.options = [{
      name: "text-channel",
      type: 7,
      description: "Channel where to put the message of the bot.",
      channelTypes: [0, 5, 10, 11, 12],
      required: true
    }, {
      name: "category-channel",
      type: 7,
      description: "Channel where to put the tickets.",
      channelTypes: [4],
      required: true
    }, {
      name: "embed-title",
      type: 3,
      description: "A title to differentiate the embed from others. (MAX 256 CHARACTERS)",
      required: true
    }, {
      name: "button-text",
      type: 3,
      description: "A text to put on the button (MAX 80 CHARACTERS)",
      required: false
    }, {
      name: "button-emoji",
      type: 3,
      description: "A valid emoji for the button",
      required: false
    }]
    this.guildonly = true;
    this.permissions = {
      user: [8n, 0n],
      bot: [0n, 0n]
    };
  }
  async run(bot, interaction) {
    const channel = interaction.options.getChannel("text-channel", true);
    if (!channel.permissionsFor(bot.user.id).has(["SendMessages", "EmbedLinks"])) return await interaction.reply("[startticket.text-channel] I don't have the `SendMessages` and the `EmbedLinks` permission in that channel.");
    const category = interaction.options.getChannel("category-channel", true);
    if (!category.permissionsFor(bot.user.id).has(["ViewChannel", "ManageChannels", "ManageRoles"])) return await interaction.reply("[startticket.category-channel] I don't have the `ViewChannel`, `ManageChannels` and `ManageRoles` (Manage Permissions) permissions in that channel.");
    const pre_emoji = interaction.options.getString("button-emoji", false);
    if (interaction.guild.emojis.cache.size < 1) await interaction.guild.emojis.fetch();
    if (interaction.options.getString("embed-title", true).length > 256) return await interaction.reply("[startticket.embed-title] You can only put up to 256 characters max.")
    const emoji = (pre_emoji ? (bot.emojis.cache.get(pre_emoji)?.identifier || bot.emojis.cache.find(e => e.name === pre_emoji || e.toString() === pre_emoji)?.identifier || (/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/.test(pre_emoji) ? pre_emoji : undefined)) : undefined);
    const button_text = interaction.options.getString("button-text", false);
    if (!emoji && !button_text) return await interaction.reply("You need at least one text or one emoji for the button.");
    if (button_text?.length > 80) return await interaction.reply("[startticket.button-text] You can only put up to 80 characters max.")
    try {
      const embed = new Discord.EmbedBuilder()
        .setTitle(interaction.options.getString("embed-title", true))
        .setDescription(`Press ${emoji ? (/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/.test(emoji) ? emoji : `<${(emoji.startsWith("a") ? "" : ":") + emoji}>`) : "the button"} to create a ticket.`)
        .setColor("Random")
        .setFooter({ text: 'You can only have one ticket at a time' });
      const button = new Discord.ButtonBuilder()
        .setCustomId("ticket_f")
        .setStyle("Primary");
      if (emoji) button.setEmoji(emoji);
      if (button_text) button.setLabel(button_text);

      const msg = await channel.send({ embeds: [embed], components: [new Discord.ActionRowBuilder().addComponents([button])] });
      await ticket.create({
        guildId: interaction.guild.id,
        channelId: channel.id,
        messageId: msg.id,
        categoryId: category.id,
        roles: [],
        manual: true,
        welcomemsg: "I've created your ticket correctly, %AUTHOR%",
        desc: "Ticket from %AUTHOR%"
      });
      await category.permissionOverwrites.create(interaction.guild.id, { ViewChannel: false }, { type: 0 });
      await interaction.reply("I'm listening!\n\nDefine who can see/write/etc. on tickets or not in the category channel overrides.\nYou can make a user can close a ticket or not by giving them the `ManageChannels` permission in the category of the ticket, or by defining one of their roles with `/modifyticket set-roles <message-id> roleID1 roleID2 roleIDN...`");
    } catch (err) {
      await interaction.reply("Some error ocurred. Here's a debug: " + err);
    }

  }
}
