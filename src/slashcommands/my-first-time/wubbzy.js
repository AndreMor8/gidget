export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Hello Wubbzy!";
    this.onlyguild = true;
  }
  async run(bot, interaction) {
    await interaction.reply({ content: 'Wubbzy is the best! <a:WubbzyFaceA:612311062611492900>' });
  }
}