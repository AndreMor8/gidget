const MessageModel = require("../../database/models/ticket");
const { Pèrmissions, MessageEmbed } = require("discord.js") 
module.exports = {
  run: async (bot, message, args) => {
    if(!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("Sorry, you don\'t have permission for that!")
    if(!args[1]) return message.channel.send("Put a message ID");
    const msgDocument = await MessageModel.findOne({ guildId: message.guild.id, messageId: args[1] });
    if(!msgDocument) return message.channel.send("I can't find a ticket system in that message.");
    let { manual } = msgDocument;
    if(!args[2]) {
      return message.channel.send(new MessageEmbed()
                                 .setTitle(message.guild.name + " ticket config")
                                 .setDescription(`For the message with ID ` + msgDocument.messageId + `. [Message Link](https://ptb.discordapp.com/channels/${msgDocument.guildId}/${msgDocument.channelId}/${msgDocument.messageId})\n\`modifyticket <id> <option> <...args>\``)
                                 .addField("Channel", "<#" + msgDocument.channelId + ">")
                                 .addField("Category (category)", message.guild.channels.cache.get(msgDocument.categoryId).name)
                                 .addField("Roles (setroles)", msgDocument.roles[0] ? msgDocument.roles.map(r => "<@&" + r + ">").join(", "): "No Roles")
                                 .addField("Manual closing? (manual)", manual ? "Yes" : "No")
                                 .addField("Emoji to react", Number(msgDocument.emojiId) ? (bot.emojis.cache.get(msgDocument.emojiId) ? bot.emojis.cache.get(msgDocument.emojiId).toString() : "Deleted") : msgDocument.emojiId)
                                 .addField("Perms (perms)", msgDocument.perms[0] ? msgDocument.perms.join(", ") : "?")
                                 .addField("Welcome (welcomemsg)", msgDocument.welcomemsg ? msgDocument.welcomemsg : "None")
                                 .addField("Text channel description (desc)", msgDocument.desc ? msgDocument.desc : "None"))
    };
    switch (args[2]) {
      case "perms":
        try {
          if(!args[3]) return message.channel.send("Put some permissions!");
          let perms = new Permissions(args.slice(2));
          msgDocument.updateOne({ perms: perms.toArray() }).then(() => message.channel.send("Permissions to close tickets, saved correctly. *Better use roles*"));
        } catch (err) {
          message.channel.send("Error: " + err);
        }
        break;
      case "setroles":
        if(!args[3]) return message.channel.send("Put some roles (Remember that you will overwrite the previous roles!)");
        if(args[3] === "delete") {
          return msgDocument.updateOne({ roles: [] }).then(() => message.channel.send("No one will be able to close tickets unless they have the stipulated permissions."));
        }
        let roles = message.mentions.roles.first() ? message.mentions.roles : args.slice(3);
        if(message.mentions.roles.first()) {
          let toput = roles.filter(r => !r.deleted && r.guild.id === message.guild.id).map(r => r.id);
          msgDocument.updateOne({ roles: toput }).then(() => message.channel.send("Roles updated correctly"))
        } else {
          let toput = [];
          for (let i in roles) {
            if(!message.guild.roles.cache.has(roles[i])) {
              message.channel.send("The role " + roles[i] + " isn't valid!");
            } else {
              toput.push(roles[i]);
            }
          }
          msgDocument.updateOne({ roles: toput }).then(() => message.channel.send("Roles updated correctly"))
        }
        break;
      case "manual":
        msgDocument.updateOne({ manual: !manual }).then(() => message.channel.send(!manual ? "Now the people who created the tickets can close them themselves." : "Now only those with the permissions or roles set will be able to close tickets."));
        break;
      case "category":
        let channel = message.guild.channels.cache.get(args[3]);
        if(!channel) return message.channel.send("Invalid channel.")
        if(channel.type !== "category") return message.channel.send("Invalid channel type");
        msgDocument.updateOne({ categoryId: channel.id }).then(() => message.channel.send("Category channel updated correctly."));
        break;
      case "welcomemsg":
        let tomodify = "";
        if(!args[3]) return message.channel.send("Put something. You can put `none` for disable the message. For mention the ticket author, put `%AUTHOR%` in your message");
        if(args[3] !== "none") {
          tomodify = args.slice(3).join(" ");
        }
        msgDocument.updateOne({ welcomemsg: tomodify }).then(() => message.channel.send(tomodify ? "Welcome message for the ticket changed correctly" : "Welcome message disabled"));
        break;
      case "desc":
        let tomodify2 = "";
        if(!args[3]) return message.channel.send("Put something. You can put `none` for disable the description. For mention the ticket author, put `%AUTHOR%` in your description");
        if(args[3] !== "none") {
          tomodify2 = args.slice(3).join(" ");
        }
        msgDocument.updateOne({ desc: tomodify2 }).then(() => message.channel.send(tomodify2 ? "Description for the ticket changed correctly" : "Text channel description disabled"));
        break;
      default: 
        message.channel.send("Invalid mode!");
    }
  },
  aliases: [],
  description: "Modify the ticket system"
}