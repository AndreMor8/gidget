import MessageModel from "../../database/models/ticket.js";
import { EmbedBuilder } from "discord.js";

export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Modify the ticket system";
    this.deployOptions.options = [{
      name: "get",
      type: 1,
      description: "Get the current ticket configuration",
      options: [
        {
          name: "message",
          type: 3,
          description: "Message ID that relates a ticket system",
          required: true
        }
      ]
    }, {
      name: "set-roles",
      description: "These roles can close tickets.",
      type: 1,
      options: [{
        name: "message",
        type: 3,
        description: "Message ID that relates a ticket system",
        required: true
      }, {
        name: "roles",
        type: 3,
        description: "Roles that can close tickets (separated with spaces)",
        required: false
      }]
    }, {
      name: "manual",
      type: 1,
      description: "Configure whether the users who created the ticket can close it by themselves.",
      options: [{
        name: "message",
        type: 3,
        description: "Message ID that relates a ticket system",
        required: true
      }]
    }, {
      name: "category",
      type: 1,
      description: "Configure where the new tickets will go.",
      options: [{
        name: "message",
        type: 3,
        description: "Message ID that relates a ticket system",
        required: true
      }, {
        name: "channel",
        type: 7,
        description: "Category channel where the tickets will be.",
        channelTypes: [4],
        required: true
      }]
    }, {
      name: "welcome-msg",
      type: 1,
      description: "Welcome the user to the ticket with this",
      options: [{
        name: "message",
        type: 3,
        description: "Message ID that relates a ticket system",
        required: true
      }, {
        name: "msg",
        type: 3,
        description: "Welcome message (MAX 2000 CHARACTERS)",
        required: false
      }]
    }, {
      name: "desc",
      type: 1,
      description: "The message that will appear in the ticket topic",
      options: [{
        name: "message",
        type: 3,
        description: "Message ID that relates a ticket system",
        required: true
      }, {
        name: "description",
        type: 3,
        description: "The content of the description/topic (MAX 1024 CHARACTERS)",
        required: false
      }]
    }]
    this.guildonly = true;
    this.permissions = {
      user: [8n, 0n],
      bot: [0n, 16384n]
    };
  }
  async run(bot, interaction) {
    const subcommand = interaction.options.getSubcommand();
    const msgID = interaction.options.getString("message", true);
    const msgDocument = await MessageModel.findOne({ guildId: { $eq: interaction.guild.id }, messageId: { $eq: msgID } });
    if (!msgDocument) return await interaction.reply("I can't find a ticket system in that message.");
    const { manual } = msgDocument;
    switch (subcommand) {
      case "get": {
        await interaction.reply({
          embeds: [new EmbedBuilder()
            .setTitle(interaction.guild.name + " ticket config")
            .setDescription(`For the message with ID ` + msgDocument.messageId + `. [Message Link](https://ptb.discordapp.com/channels/${msgDocument.guildId}/${msgDocument.channelId}/${msgDocument.messageId})\n\`modifyticket <id> <option> <...args>\``)
            .addFields([
              { name: "Channel", value: `<#${msgDocument.channelId}>` },
              { name: "Category (category)", value: `<#${msgDocument.categoryId}>` },
              { name: "Roles (they can close the ticket) (setroles)", value: msgDocument.roles[0] ? msgDocument.roles.map(r => "<@&" + r + ">").join(", ") : "No Roles" },
              { name: "Manual closing? (manual)", value: manual ? "Yes" : "No" },
              { name: "Welcome (welcomemsg)", value: msgDocument.welcomemsg || "None" },
              { name: "Text channel description (desc)", value: msgDocument.desc || "None" }
            ])]
        });
      }
        break;
      case "set-roles": {
        const roles = interaction.options.getString("roles", false)?.split(" ");
        if (roles) {
          const toput = [];
          for (const i in roles) {
            if (!interaction.guild.roles.cache.has(roles[i])) {
              return await interaction.reply("The role " + roles[i] + " isn't valid!");
            } else {
              toput.push(roles[i]);
            }
          }
          await msgDocument.updateOne({ $set: { roles: toput } });
          await interaction.reply("Roles updated correctly\nRemember to configure the role in the category so that its members can see and write on the ticket.");
        } else {
          await msgDocument.updateOne({ $set: { roles: [] } });
          await interaction.reply("No one will be able to close tickets unless they have `ManageChannels` permission on the ticket category.");
        }
      }
        break;
      case "manual":
        await msgDocument.updateOne({ manual: !manual });
        await interaction.reply(interaction.reply(!manual ? "Now the people who created the tickets can close them themselves." : "Now only those with the permissions or roles set will be able to close tickets."));
        break;
      case "category": {
        const channel = interaction.options.getChannel("channel", true);
        if (!channel.permissionsFor(bot.user.id).has(["ViewChannel", "ManageChannels", "ManageRoles"])) return await interaction.reply("I don't have the `ManageChannels`, the `ManageRoles` or the `ViewChannel` permission in that channel.");
        await msgDocument.updateOne({ categoryId: channel.id });
        await interaction.reply("Category channel updated correctly.")
      }
        break;
      case "welcome-msg": {
        const set = interaction.options.getString("msg", false);
        if (set) {
          if (set.replace("%AUTHOR%", interaction.user.toString()).length > 2000) return await interaction.reply("You can only put up to 2000 characters max.");
          await msgDocument.updateOne({ $set: { welcomemsg: set } });
        }
        else await msgDocument.updateOne({ $unset: { welcomemsg: "" } });
        await interaction.reply(set ? "Welcome message for the ticket changed correctly" : "Welcome message disabled")
      }
        break;
      case "desc": {
        const set = interaction.options.getString("description", false);
        if (set) {
          if (set.replace("%AUTHOR%", interaction.user.toString()).length > 1024) return await interaction.reply("You can only put up to 1024 characters max.");
          await msgDocument.updateOne({ $set: { desc: set } });
        }
        else await msgDocument.updateOne({ $unset: { desc: "" } });
        await interaction.reply(set ? "Description for the ticket changed correctly" : "Text channel description disabled")
      }
        break;
    }
  }
}