const Discord = require('discord.js');

module.exports = {
    run: async (bot, message, args) => {
        // Check if you can delete the message
        if (message.deletable) message.delete();
      
        if (!args[1]) return message.reply(`Nothing to say?`).then(m => m.delete( {timeout: 5000} ));
      
        if(message.member.hasPermission("MENTION_EVERYONE")){
          message.channel.send(args.slice(1).join(" "), { allowedMentions: { parse: ["users", "everyone", "roles"] } });
        } else {
          message.channel.send(args.slice(1).join(" "));
        }
    },
    aliases: [],
    description: "Make me say something",
}
