const { MessageEmbed } = require("discord.js");
module.exports = {
  run: async (bot, message, args) => {
    if (!message.guild) return message.channel.send('This command only works on servers.')
    if (!message.member.hasPermission("MANAGE_EMOJIS")) return message.channel.send("You do not have permissions to execute this command");
    if (!message.guild.me.hasPermission("MANAGE_EMOJIS")) return message.channel.send("I need the `MANAGE_EMOJIS` permission for that :(")
    if (!args[1]) return message.channel.send("Usage: limitemojis <emoji> <mode> <role(s)>");
    let e = message.guild.emojis.cache.get(args[1]) || message.guild.emojis.cache.find(e => e.name === args[1])
    if (e) return cmd_sendumfrage(message, args.slice(2), e.id);
    else return cmd_umfrage(message, args.slice(1));
    function cmd_umfrage(msg, args) {
      if (args.length) {
        var custom = /^<a?:/;
        var reactions = [];
        let reaction = args[0];
        if (custom.test(reaction)) {
          reaction = reaction.substring(
            reaction.lastIndexOf(":") + 1,
            reaction.length - 1
          );
          reactions[0] = reaction;
          return cmd_sendumfrage(msg, args.slice(1), reactions[0]);
        } else {
          return message.channel.send("That isn't a custom emoji!");
        }
      }
    }

    function cmd_sendumfrage(msg, args, emoji) {
      let emojiobj = msg.guild.emojis.cache.get(emoji);
      if(!emojiobj) return message.channel.send("That emoji isn't on the server");
      if(!args[0]) {
        if(!emojiobj.roles.cache.first()) return message.channel.send("That emoji can be used by anyone");
        let text = emojiobj.roles.cache.map(e => e.toString()).join("\n");
        const embed = new MessageEmbed()
        .setTitle("List of roles they can use " + emojiobj.name)
        .setDescription(text)
        return message.channel.send(embed);
      }
      let roles = msg.mentions.roles.first() ? msg.mentions.roles : args.slice(1);
      
      switch (args[0]) {
        case "add":
          emojiobj.roles.add(roles).then(e => message.channel.send("Ok. I've put the roles correctly")).catch(err => message.channel.send("Some error ocurred! Here's a debug: " + err));
          break;
        case "remove":
          emojiobj.roles.remove(roles).then(e => message.channel.send("Ok. I've put the roles correctly")).catch(err => message.channel.send("Some error ocurred! Here's a debug: " + err));
          break;
        case "set":
          emojiobj.roles.set(roles).then(e => message.channel.send("Ok. I've put the roles correctly")).catch(err => message.channel.send("Some error ocurred! Here's a debug: " + err));
          break;
      }
      
    }
  },
  aliases: ["le"],
  description: "Limit emojis to certain roles"
}
/*
Now the roles that can use the emoji are: " + e.roles.cache.first() ? e.roles.cache.map(r => r.name).join(", ") : "Everyone
*/