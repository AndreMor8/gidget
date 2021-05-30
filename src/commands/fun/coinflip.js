import { MessageButton } from 'discord-buttons';
export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Coin flip";
  }
  async run(bot, message) {
    const arr = ["Heads", "Tails"];
    const but_redo = new MessageButton()
      .setID("coinflip_c_redo")
      .setStyle("blurple")
      .setLabel("Retry");
    const msg = await message.channel.send(`You got: **${arr[Math.floor(Math.random() * 2)]}**!`, { buttons: [but_redo] });
    const filter = (button) => {
      if ((button.clicker.user?.id || button.message.channel.recipient?.id) !== message.author.id) button.reply.send("Use your own instance by using `g%coinflip`", true);
      return (button.clicker.user?.id || button.message.channel.recipient?.id) === message.author.id;
    };
    const col = msg.createButtonCollector(filter, { idle: 15000 });
    col.on("collect", async (button) => {
      await button.defer();
      if (button.id === "coinflip_c_redo") {
        msg.edit(`You got: **${arr[Math.floor(Math.random() * 2)]}**!`);
      }
    });
    col.on("end", () => {
      msg.edit(msg.content, { buttons: [but_redo.setDisabled(true)] });
    });
  }
}