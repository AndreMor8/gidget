//Note that if you dont like this command you can delete it safely because i made this when i was new to discordjs and it is not neccesary to the bot
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["wubbzypedia-staff"];
    this.description = "Wubbzypedia staff :)";
    this.onlyguild = true;
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 0n]
    };
  }
  async run(bot, message) {
    const members = ["**SuKanzoo**", "**AndreMor**", "**Thevideogameguy22**", "**Wubbzy! Wow!**", "**DerpJobi**"];
    const description = ["He is the greatest Wubbzy fan that you have ever seen", "A 15 year old boy from Peru who is helping with the CSS and JS of Wubbzypedia and the international content. A great Wubbzy fan too.", "A 15 year old boy, who loves the show and has always contributed to the wiki. Hobbies: Loves playing Guitar Hero and Just Dance", "He supports the HD content of the series, both uploading videos on his channel and uploading frames here.", "He has been supporting Wubbzypedia lately, such as detecting errors, reversing bad edits, helping to place templates, and editing :)"];
    const permissions = ["Bureaucrat", "Bureaucrat", "Bureaucrat", "Content Moderator", "Content Moderator"];
    let text = "";
    for (let i = 0; i < 5; i++) {
      text += members[i] + ": " + description[i] + "\n**Permissions:** " + permissions[i] + "\n \n";
    }
 await message.channel.send("The Wubbzypedia staff: \n" + text);
  }
}