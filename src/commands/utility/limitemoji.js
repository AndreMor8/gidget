
import { MessageEmbed } from "discord.js";
export default class extends Command {
  constructor(options) {
    super(options)
    this.aliases = ["le"];
    this.description = "Limit emojis to certain roles";
    this.guildonly = true;
    this.permissions = {
      user: [1073741824n, 0n],
      bot: [1073741824n, 0n]
    };
  }
  // eslint-disable-next-line require-await
  async run(bot, message, args) {
    if (!args[1])
      return message.channel.send("Usage: limitemojis <emoji> <mode> <role(s)>");
    const e = message.guild.emojis.cache.get(args[1]) || message.guild.emojis.cache.find(e => e.name === args[1]) || await message.guild.emojis.fetch(args[1]).catch(() => {});
    if (e)
      return cmd_sendumfrage(message, args.slice(2), e.id);
    else
      return cmd_umfrage(message, args.slice(1));
    function cmd_umfrage(msg, args) {
      if (args.length) {
        const custom = /^<a?:/;
        const reactions = [];
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
    
    async function cmd_sendumfrage(msg, args, emoji) {
      const emojiobj = msg.guild.emojis.cache.get(emoji) || await msg.guild.emojis.fetch(emoji).catch(() => {});
      if (!emojiobj)
        return message.channel.send("That emoji isn't on the server\n\nIf it really is, use the emoji ID.");
      if (!args[0]) {
        if (!emojiobj.roles.cache.first())
          return message.channel.send("That emoji can be used by anyone\n\nAvailable modes: `add`, `remove`, `set`");
        const text = emojiobj.roles.cache.map(e => e.toString()).join("\n");
        const embed = new MessageEmbed()
          .setTitle("List of roles they can use " + emojiobj.name)
          .setDescription(text)
          .setFooter("Available modes: add, remove, set");
        return message.channel.send({embeds: [embed]});
      }
      const roles = msg.mentions.roles.first() ? msg.mentions.roles : args.slice(1);

      switch (args[0]) {
        case "add":
          if(!args[1]) return message.channel.send("Please specify roles!");
          emojiobj.roles.add(roles).then(() => message.channel.send("Ok. I've put the roles correctly")).catch(err => message.channel.send("Some error ocurred! Here's a debug: " + err));
          break;
        case "remove":
          if(!args[1]) return message.channel.send("Please specify roles!");
          emojiobj.roles.remove(roles).then(() => message.channel.send("Ok. I've put the roles correctly")).catch(err => message.channel.send("Some error ocurred! Here's a debug: " + err));
          break;
        case "set":
          if(!args[1]) return message.channel.send("Please specify roles!");
          emojiobj.roles.set(roles).then(() => message.channel.send("Ok. I've put the roles correctly")).catch(err => message.channel.send("Some error ocurred! Here's a debug: " + err));
          break;
      }

    }
  }
}