export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["cc"];
    this.description = "Set the confession channel and whether to allow anonymity.\nThe bot is not responsible for what is sent in the confession channel.\nEverything is done with an ephemeral slash command.";
    this.guildonly = true;
    this.permissions = {
      user: [8, 0],
      bot: [0, 0]
    }
  }
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send("Usage: confessionconfig [<config> <value>]\nAvaliable modes: `channel`, `anon`, `disable`, `get`");
    switch (args[1]) {
      case 'channel': {
        const channel = message.mentions.channels.filter(e => e.guild.id === message.guild.id && (e.type === "text" || e.type === "news")).first() || message.guild.channels.cache.filter(e => e.type === "text" || e.type === "news").get(args[2]);
        if (!channel) return message.channel.send("Please enter a valid channel!");
        if (!channel.permissionsFor(message.guild.me).has(["SEND_MESSAGES", "EMBED_LINKS"])) return message.channel.send("I don't have the permissions to send embeds on that channel.\nGive me the permissions to send messages and embed links!");
        await message.guild.setConfessionChannel(channel);
        message.channel.send("The channel has been set correctly.");
      }
        break;
      case 'anon': {
        const res = await message.guild.setConfessionAnon();
        if (res) message.channel.send("Optional anonymity for confessions has been enabled!\n\n**WARNING**: The `confession` command is a ephemeral slash command. This means that no one, not even a bot, will be able to see who published it, if the user chose anonymity. The bot is not responsible for the content that the user sends there!");
        else message.channel.send("Optional anonymity for confessions has been disabled!");
      }
        break;
      case 'disable': {
        await message.guild.deleteConfessionConfig();
        message.channel.send("I have deleted the confession channel ID from my database. Re-enable the system with `confessionconfig channel <channel>`.");
      }
        break;
      case 'get':
      default: {
        const data = message.guild.cache.confessionconfig ? message.guild.confessionconfig : await message.guild.getConfessionConfig();
        if (!data.channelID) return message.channel.send("Set a channel!\n`g%confessionconfig channel`")
        message.channel.send(`Confession config for ${message.guild.name}\n\n**Channel**: <#${data.channelID}>\n**Optional anonymity**: ${data.anon ? "Enabled" : "Disabled"}\n\nAvaliable modes: \`channel\`, \`anon\`, \`disable\`, \`get\``);
      }
    }
  }
}