import { setWarn } from "../../extensions.js";
export default class extends SlashCommand {
  constructor(options) {
    super(options)
    this.deployOptions.name = "warn";
    this.deployOptions.type = 2;
    this.guildonly = true;
    this.permissions = {
      user: [4n, 0n],
      bot: [268435456n, 0n]
    };
  }
  async run(bot, interaction) {
    const member = interaction.guild.members.cache.get(interaction.targetId) || await interaction.guild.members.fetch(interaction.targetId).catch(() => { });
    if (!member) return await interaction.reply({ content: "Invalid member!", ephemeral: true });
    if (member.id === interaction.guild.ownerId) return await interaction.reply({ content: "You cannot warn the owner.", ephemeral: true });
    if (interaction.member.id !== interaction.guild.ownerId) {
      if (member.roles.highest.comparePositionTo(interaction.member.roles.highest) >= 0) return await interaction.reply({ content: "You cannot warn someone with a role with a higher or equal rank than yours.", ephemeral: true });
    }
    const warns = await setWarn(member, `Context menu warn command by ${interaction.member.toString()}`);
    await interaction.reply(`I've warned ${member.toString()}. Now they have ${warns} warning(s).`);
  }
}