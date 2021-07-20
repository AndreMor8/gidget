import MessageModel from "../../database/models/ticket.js";
import { MessageEmbed } from "discord.js";

export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Modify the ticket system";
    this.deployOptions.options = [
      {
        name: "get",
        type: "SUB_COMMAND",
        description: "Get the current ticket configuration",
        options: [
          {
            name: "message",
            type: "STRING",
            description: "Message ID that relates a ticket system",
            required: true
          }
        ]
      },
      {
        name: "set-roles",
        description: "These roles can close tickets.",
        type: "SUB_COMMAND",
        options: [
          {
            name: "message",
            type: "STRING",
            description: "Message ID that relates a ticket system",
            required: true
          },
          {
            name: "roles",
            type: "STRING",
            description: "Roles that can close tickets.",
            required: false
          }
        ]
      },
      {
        name: "manual",
        type: "SUB_COMMAND",
        description: "Configure whether the users who created the ticket can close it by themselves.",
        options: [
          {
            name: "message",
            type: "STRING",
            description: "Message ID that relates a ticket system",
            required: true
          }
        ]
      },
      {
        name: "category",
        type: "SUB_COMMAND",
        description: "Configure where the new tickets will go.",
        options: [
          {
            name: "message",
            type: "STRING",
            description: "Message ID that relates a ticket system",
            required: true
          },
          {
            name: "channel",
            type: "CHANNEL",
            description: "Category channel where the tickets will be.",
            required: true
          }]
      },
      {
        name: "welcome-msg",
        type: "SUB_COMMAND",
        description: "Welcome the user to the ticket with this",
        options: [
          {
            name: "message",
            type: "STRING",
            description: "Message ID that relates a ticket system",
            required: true
          },
          {
            name: "msg",
            type: "STRING",
            description: "Welcome message (MAX 2000 CHARACTERS)",
            required: false
          }
        ]
      },
      {
        name: "desc",
        type: "SUB_COMMAND",
        description: "The message that will appear in the ticket topic",
        options: [{
          name: "message",
          type: "STRING",
          description: "Message ID that relates a ticket system",
          required: true
        },
        {
          name: "description",
          type: "STRING",
          description: "The content of the description/topic (MAX 1024 CHARACTERS)",
          required: false
        }]
      }
    ]
    this.guildonly = true;
    this.permissions = {
      user: [8n, 0n],
      bot: [0n, 16384n]
    };
  }
  async run(bot, interaction) {
    const subcommand = interaction.options.first();
    const msgID = subcommand.options.find(e => e.name === "message").value;
    const msgDocument = await MessageModel.findOne({ guildId: { $eq: interaction.guild.id }, messageId: { $eq: msgID } });
    if (!msgDocument) return interaction.reply("I can't find a ticket system in that message.");
    const { manual } = msgDocument;
    switch (interaction.options.first().name) {
      case "get": {
        if (msgDocument.emojiId) await interaction.channel.send("**WARNING:** This ticket was created using version 1 of Gidget. In version 2 this system has changed from reactions to buttons and requires the re-creation of the ticket system. Reaction tickets will stop working on August 1.\n\nPlease re-create your ticket system.");
        interaction.reply({
          embeds: [new MessageEmbed()
            .setTitle(interaction.guild.name + " ticket config")
            .setDescription(`For the message with ID ` + msgDocument.messageId + `. [Message Link](https://ptb.discordapp.com/channels/${msgDocument.guildId}/${msgDocument.channelId}/${msgDocument.messageId})\n\`modifyticket <id> <option> <...args>\``)
            .addField("Channel", `<#${msgDocument.channelId}>`)
            .addField("Category (category)", `<#${msgDocument.categoryId}>`)
            .addField("Roles (they can close the ticket) (setroles)", msgDocument.roles[0] ? msgDocument.roles.map(r => "<@&" + r + ">").join(", ") : "No Roles")
            .addField("Manual closing? (manual)", manual ? "Yes" : "No")
            .addField("Welcome (welcomemsg)", msgDocument.welcomemsg || "None")
            .addField("Text channel description (desc)", msgDocument.desc || "None")]
        });
      }
        break;
      case "set-roles": {
        const roles = subcommand.options.find(e => e.name === "roles")?.value.split(" ");
        if (!roles) {
          await msgDocument.updateOne({ $set: { roles: [] } });
          interaction.reply("No one will be able to close tickets unless they have `MANAGE_CHANNELS` permission on the ticket category.");
        } else {
          const toput = [];
          for (const i in roles) {
            if (!interaction.guild.roles.cache.has(roles[i])) {
              return interaction.reply("The role " + roles[i] + " isn't valid!");
            } else {
              toput.push(roles[i]);
            }
          }
          await msgDocument.updateOne({ $set: { roles: toput } });
          interaction.reply("Roles updated correctly\nRemember to configure the role in the category so that its members can see and write on the ticket.");
        }
      }
        break;
      case "manual":
        await msgDocument.updateOne({ manual: !manual });
        interaction.reply(interaction.reply(!manual ? "Now the people who created the tickets can close them themselves." : "Now only those with the permissions or roles set will be able to close tickets."));
        break;
      case "category": {
        const channel = subcommand.options.find(e => e.name === "channel").channel;
        if (channel.type !== "category") return interaction.reply("Invalid channel type");
        if (!channel.permissionsFor(bot.user.id).has(["VIEW_CHANNEL", "MANAGE_CHANNELS", "MANAGE_ROLES"])) return interaction.reply("I don't have the `MANAGE_CHANNELS` permission in that channel.");
        await msgDocument.updateOne({ categoryId: channel.id });
        interaction.reply("Category channel updated correctly.")
      }
        break;
      case "welcome-msg": {
        const set = subcommand.options.find(e => e.name === "msg")?.value;
        if (set) {
          if (set.replace("%AUTHOR%", interaction.user.toString()).length > 2000) return interaction.reply("You can only put up to 2000 characters max.");
          await msgDocument.updateOne({ $set: { welcomemsg: set } });
        }
        else await msgDocument.updateOne({ $unset: { welcomemsg: "" } });
        interaction.reply(set ? "Welcome message for the ticket changed correctly" : "Welcome message disabled")
      }
        break;
      case "desc": {
        const set = subcommand.options.find(e => e.name === "description")?.value;
        if (set) {
          if (set.replace("%AUTHOR%", interaction.user.toString()).length > 1024) return interaction.reply("You can only put up to 1024 characters max.");
          await msgDocument.updateOne({ $set: { desc: set } });
        }
        else await msgDocument.updateOne({ $unset: { desc: "" } });
        interaction.reply(set ? "Description for the ticket changed correctly" : "Text channel description disabled")
      }
        break;
    }
  }
}