
export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.guildonly = true;
    this.deployOptions.description = "Ban a user even if they aren't on the server.";

    this.deployOptions.options = [{
      type: 6,
      name: "user",
      description: "User to ban (for non-members, just paste the ID here)",
      required: true
    }, {
      type: 3,
      name: "reason",
      description: "Reason to ban that user",
      required: false
    }]

    this.permissions = {
      user: [4n, 0n],
      bot: [4n, 0n]
    }
  }
  async run(bot, interaction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    try {
      const member = await interaction.guild.members.fetch(user).catch(() => { });
      if (member) {
        if (member.roles.highest.comparePositionTo(interaction.member.roles.highest) >= 0 && interaction.guild.ownerId !== interaction.member.id) return interaction.reply(`You cannot ban someone whose superior role position surpasses or equals yours.`);
        if (!member.bannable) return interaction.reply("I can't ban that user!");
      }
      await interaction.guild.members.ban(user, { reason: `Command /hackban executed by ${interaction.user.tag}${reason ? `: ${reason}` : ""}` });
      await interaction.reply(`I've hackbanned ${user.tag} correctly!`);
    } catch (err) {
      await interaction.reply(`I couldn't hackban ${user}: ${err}`).catch(() => { });
    }
  }
}