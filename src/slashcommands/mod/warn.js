export default class extends SlashCommand {
  constructor(options) {
    super(options)
    this.deployOptions.name = "warn";
    this.deployOptions.description = undefined;
    this.deployOptions.type = 2;
    this.guildonly = true;
    this.permissions = {
      user: [4n, 0n],
      bot: [268435456n, 0n]
    };
  }
  async run(bot, raw, interaction) {
    const member = interaction.guild.members.cache.get(raw.data.target_id) || await interaction.guild.members.fetch(raw.data.target_id).catch(() => { });
    if (!member) return interaction.reply({ content: "Invalid member!", ephemeral: true });
    if (member.id === interaction.guild.ownerID) return interaction.reply({ content: "You cannot warn the owner.", ephemeral: true });
    if (interaction.member.id !== interaction.guild.ownerID) {
      if (member.roles.highest.comparePositionTo(interaction.member.roles.highest) >= 0) return interaction.reply({ content: "You cannot warn someone with a role with a higher or equal rank than yours.", ephemeral: true });
    }
    const warns = await member.setWarn(`Context menu warn command by ${interaction.member.toString()}`);
    interaction.reply(`I've warned ${member.toString()}. Now they have ${warns} warning(s).`);
  }
}