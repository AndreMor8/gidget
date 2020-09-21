import Command from '../../utils/command.js';
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["bulkdelete", "prune"];
    this.description = "Bulk delete messages";
    this.guildonly = true;
    this.permissions = {
      user: [0, 8192],
      bot: [0, 8192]
    };
  }
  async run(message, args) {
    if (!args[1] || (isNaN(args[1]) && !args[2]))
      return message.reply('how many messages should I delete? Specify it.');
    let number = args[2] ? parseInt(args[2]) : parseInt(args[1]);
  
    if (!isNaN(number) && (number <= 100) && (number >= 1)) {
      await message.delete();
      switch (args[1]) {
        case 'users': {
          if (!args[3])
            return message.channel.send("Mention or put the ID of the people whom you want their messages to be deleted.\n`purge users <number> <mentions>`");
          const authors = message.mentions.users.size ? message.mentions.users.keyArray() : args.slice(3);
          const messages = await message.channel.messages.fetch({
            limit: number
          }, false);
          messages.sweep(m => !authors.includes(m.author.id));
          await message.channel.bulkDelete(messages, true);
          let thing = await message.channel.send(messages.size + " messages were successfully deleted");
          thing.delete({ timeout: 5000 });
        }
          break;
        case 'bots': {
          const messages = await message.channel.messages.fetch({
            limit: number
          }, false);
          messages.sweep(m => !m.author.bot);
          await message.channel.bulkDelete(messages, true);
          let thing = await message.channel.send(messages.size + " messages were successfully deleted");
          thing.delete({ timeout: 5000 });
        }
          break;
        case 'attachments': {
          const messages = await message.channel.messages.fetch({
            limit: number
          }, false);
          messages.sweep(m => !m.attachments.first());
          await message.channel.bulkDelete(messages, true);
          let thing = await message.channel.send(messages.size + " messages were successfully deleted");
          thing.delete({ timeout: 5000 });
        }
          break;
        case 'embeds': {
          const messages = await message.channel.messages.fetch({
            limit: number
          }, false);
          messages.sweep(m => !m.embeds[0]);
          await message.channel.bulkDelete(messages, true);
          let thing = await message.channel.send(messages.size + " messages were successfully deleted");
          thing.delete({ timeout: 5000 });
        }
          break;
        case 'with': {
          const messages = await message.channel.messages.fetch({
            limit: number
          }, false);
          messages.sweep(m => !(new RegExp(args.slice(3).join(" "), "gmi").test(m.content)));
          await message.channel.bulkDelete(messages, true);
          let thing = await message.channel.send(messages.size + " messages were successfully deleted");
          thing.delete({ timeout: 5000 });
        }
          break;
        default: {
          if (args[2])
            return message.channel.send("Invalid mode!");
          await message.channel.bulkDelete(number, true);
        }
      }
    } else {
      if (isNaN(number)) {
        message.channel.send('That isn\'t a number!');
      } else if (number > 100) {
        message.channel.send('I can only delete 100 messages at a time.');
      } else if (number < 1) {
        message.channel.send('I don\'t think 0 or less is what you want to delete.');
      }
    }
  }
}