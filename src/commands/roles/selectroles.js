export default class extends Command {
    constructor(options) {
      super(options);
      this.aliases = [];
      this.description = "**(Slash command)** Use Discord's new menu selector to add self-roles to users in just 1 step.";
      this.guildonly = true;
      this.permissions = {
        user: [8n, 0n],
        bot: [268435456n, 0n]
      }
    }
    async run(bot, message) {
        if(message.deletable) await message.delete();
        message.channel.send("This is a slash command, please use it in the Discord interface.");
    }
  }