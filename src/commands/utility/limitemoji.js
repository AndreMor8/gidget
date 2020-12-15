
import { MessageEmbed } from "discord.js";
export default class extends Command {
  constructor(options) {
    super(options)
    this.aliases = ["le"];
    this.description = "Limit emojis to certain roles";
    this.guildonly = true;
    this.permissions = {
      user: [1073741824, 0],
      bot: [1073741824, 0]
    };
  }
  // eslint-disable-next-line require-await
  async run(bot, message, args) {
    if (!args[1])
      return message.channel.send("Usage: limitemojis <emoji> <mode> <role(s)>");
    const e = message.guild.emojis.cache.get(args[1]) || message.guild.emojis.cache.find(e => e.name === args[1]);
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

    /**
     * @param msg
     * @param args
     * @param emoji
     */
    function cmd_sendumfrage(msg, args, emoji) {
      const emojiobj = msg.guild.emojis.cache.get(emoji);
      if (!emojiobj)
        return message.channel.send("That emoji isn't on the server");
      if (!args[0]) {
        if (!emojiobj.roles.cache.first())
          return message.channel.send("That emoji can be used by anyone");
        const text = emojiobj.roles.cache.map(e => e.toString()).join("\n");
        const embed = new MessageEmbed()
          .setTitle("List of roles they can use " + emojiobj.name)
          .setDescription(text);
        return message.channel.send(embed);
      }
      const roles = msg.mentions.roles.first() ? msg.mentions.roles : args.slice(1);

      switch (args[0]) {
        case "add":
          emojiobj.roles.add(roles).then(() => message.channel.send("Ok. I've put the roles correctly")).catch(err => message.channel.send("Some error ocurred! Here's a debug: " + err));
          break;
        case "remove":
          emojiobj.roles.remove(roles).then(() => message.channel.send("Ok. I've put the roles correctly")).catch(err => message.channel.send("Some error ocurred! Here's a debug: " + err));
          break;
        case "set":
          emojiobj.roles.set(roles).then(() => message.channel.send("Ok. I've put the roles correctly")).catch(err => message.channel.send("Some error ocurred! Here's a debug: " + err));
          break;
      }

    }
  }
}