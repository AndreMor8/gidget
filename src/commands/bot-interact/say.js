import Command from '../../utils/command.js';
export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Make me say something",
      this.permissions = {
        user: [0, 0],
        bot: [0, 0]
      }
  }
  async run(bot, message, args) {
    // Check if you can delete the message
    if (message.deletable) message.delete();

    if (!args[1]) return message.reply(`Nothing to say?`).then(m => m.delete({ timeout: 5000 }));

    if (message.member && message.member.hasPermission("MENTION_EVERYONE")) {
      await message.channel.send(args.slice(1).join(" "), { allowedMentions: { parse: ["users", "everyone", "roles"] } });
    } else {
      await message.channel.send(args.slice(1).join(" "));
    }
  }
}
