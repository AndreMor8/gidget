import { getConfessionConfig, setConfessionChannel, setConfessionAnon, deleteConfessionConfig } from "../../extensions.js";

export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Configure the confessions on your server!";
    this.deployOptions.options = [
      {
        name: "get",
        description: "Get current settings.",
        type: 1
      },
      {
        name: "channel",
        description: "Set a confessions channel!",
        type: 1,
        options: [{
          name: "channel",
          description: "Choose a channel to send user confessions. Default to remove the previously set channel.",
          type: 7,
          channelTypes: [0, 5, 10, 11, 12],
          required: false
        }]
      },
      {
        name: "anon",
        description: "Do you want to receive anonymous confessions? There is no way of knowing who did it.",
        type: 1
      },
    ]
    this.guildonly = true;
    this.permissions = {
      user: [8n, 0n],
      bot: [0n, 0n]
    }
  }
  async run(bot, interaction) {
    switch (interaction.options.getSubcommand()) {
      case 'channel': {
        const channel = interaction.options.getChannel("channel", false);
        if (channel && !channel.permissionsFor(bot.user.id).has(["SendMessages", "EmbedLinks"])) return await interaction.reply("I don't have the permissions to send embeds on that channel.\nGive me the permissions to send messages and embed links!");
        if (!channel) await deleteConfessionConfig(interaction.guild);
        else await setConfessionChannel(interaction.guild, channel);
        await interaction.reply(channel ? "The channel has been set correctly." : "I've deleted the confession channel ID from my database. Re-enable the system with `confessionconfig channel <channel>`.");
      }
        break;
      case 'anon': {
        const res = await setConfessionAnon(interaction.guild);
        if (res) interaction.reply("Optional anonymity for confessions has been enabled!\n\n**WARNING**: The `confession` command is a ephemeral slash command. This means that no one, not even a bot, will be able to see who published it, if the user chose anonymity. The bot is not responsible for the content that the user sends there!");
        else interaction.reply("Optional anonymity for confessions has been disabled!");
      }
        break;
      case 'get':
      default: {
        const data = await getConfessionConfig(interaction.guild);
        if (!data?.channelID) return await interaction.reply("Set a channel!\n`confessionconfig channel`")
        await interaction.reply(`Confession config for ${interaction.guild.name}\n\n**Channel**: <#${data.channelID}>\n**Optional anonymity**: ${data.anon ? "Enabled" : "Disabled"}`);
      }
    }
  }
}