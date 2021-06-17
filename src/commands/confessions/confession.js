export default class extends Command {
    constructor(options) {
      super(options);
      this.aliases = ["cc"];
      this.description = "**(Slash command)** Confess something to others on this server!\nPossibly I need the permission to add slash commands to your server.";
      this.guildonly = true;
      this.permissions = {
        user: [0n, 0n],
        bot: [0n, 0n]
      }
    }
    async run(bot, message) {
        if(message.deletable) await message.delete();
        message.channel.send("This is a slash command, please use it in the Discord interface.");
    }
  }