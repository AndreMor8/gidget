export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Configure the confessions on your server!";
    this.deployOptions.options = [
      {
        name: "get",
        description: "Get current settings.",
        type: "SUB_COMMAND"
      },
      {
        name: "channel",
        description: "Set a confessions channel!",
        type: "SUB_COMMAND",
        options: [{
          name: "channel",
          description: "Choose a channel to send user confessions. Default to remove the previously set channel.",
          type: "CHANNEL",
          required: false
        }]
      },
      {
        name: "anon",
        description: "Do you want to receive anonymous confessions? There is no way of knowing who did it.",
        type: "SUB_COMMAND"
      },
    ]
    this.guildonly = true;
    this.permissions = {
      user: [8n, 0n],
      bot: [0n, 0n]
    }
  }
  async run(bot, interaction) {
    switch (interaction.options.first().name) {
      case 'channel': {
        const channel = interaction.options.get("channel").options?.find(e => e.name === "channel")?.channel;
        if (channel && !channel.permissionsFor(bot.user.id).has(["SEND_MESSAGES", "EMBED_LINKS"])) return interaction.reply("I don't have the permissions to send embeds on that channel.\nGive me the permissions to send messages and embed links!");
        if (!channel) await interaction.guild.deleteConfessionConfig();
        else await interaction.guild.setConfessionChannel(channel);
        interaction.reply(channel ? "The channel has been set correctly." : "I've deleted the confession channel ID from my database. Re-enable the system with `confessionconfig channel <channel>`.");
      }
        break;
      case 'anon': {
        const res = await interaction.guild.setConfessionAnon();
        if (res) interaction.reply("Optional anonymity for confessions has been enabled!\n\n**WARNING**: The `confession` command is a ephemeral slash command. This means that no one, not even a bot, will be able to see who published it, if the user chose anonymity. The bot is not responsible for the content that the user sends there!");
        else interaction.reply("Optional anonymity for confessions has been disabled!");
      }
        break;
      case 'get':
      default: {
        const data = interaction.guild.cache.confessionconfig ? interaction.guild.confessionconfig : await interaction.guild.getConfessionConfig();
        if (!data?.channelID) return interaction.reply("Set a channel!\n`confessionconfig channel`")
        interaction.reply(`Confession config for ${interaction.guild.name}\n\n**Channel**: <#${data.channelID}>\n**Optional anonymity**: ${data.anon ? "Enabled" : "Disabled"}`);
      }
    }
  }
}