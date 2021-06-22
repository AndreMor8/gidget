import safe from 'safe-regex';
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["bulkdelete", "prune"];
    this.description = "Bulk delete messages";
    this.guildonly = true;
    this.permissions = {
      user: [0n, 8192n],
      bot: [0n, 8192n]
    };
  }
  async run(bot, message, args) {
    if (!args[1] || (isNaN(args[1]) && !args[2]))
      return message.reply('Usage: `purge [mode] <limit> [<args>]`\nDocumentation here: https://docs.gidget.xyz/features/messages/bulk-delete');
    const number = args[2] ? parseInt(args[2]) : parseInt(args[1]);

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
          const thing = await message.channel.send(messages.size.toString() + " messages were successfully deleted");
          bot.setTimeout(() => {
            if (!thing.deleted) thing.delete()
          }, 5000);
        }
          break;
        case 'bots': {
          const messages = await message.channel.messages.fetch({
            limit: number
          }, false);
          messages.sweep(m => !m.author.bot);
          await message.channel.bulkDelete(messages, true);
          const thing = await message.channel.send(messages.size.toString() + " messages were successfully deleted");
          bot.setTimeout(() => {
            if (!thing.deleted) thing.delete()
          }, 5000);
        }
          break;
        case 'attachments': {
          const messages = await message.channel.messages.fetch({
            limit: number
          }, false);
          messages.sweep(m => !m.attachments.first());
          await message.channel.bulkDelete(messages, true);
          const thing = await message.channel.send(messages.size.toString() + " messages were successfully deleted");
          bot.setTimeout(() => {
            if (!thing.deleted) thing.delete()
          }, 5000);
        }
          break;
        case 'embeds': {
          const messages = await message.channel.messages.fetch({
            limit: number
          }, false);
          messages.sweep(m => !m.embeds[0]);
          await message.channel.bulkDelete(messages, true);
          const thing = await message.channel.send(messages.size.toString() + " messages were successfully deleted");
          bot.setTimeout(() => {
            if (!thing.deleted) thing.delete()
          }, 5000);
        }
          break;
        case 'with': {
          if (!safe(args.slice(3).join(" "))) return message.channel.send("This is not a valid or safe regex.");
          const messages = await message.channel.messages.fetch({
            limit: number
          }, false);
          messages.sweep(m => !(new RegExp(args.slice(3).join(" "), "gmi").test(m.content)));
          await message.channel.bulkDelete(messages, true);
          const thing = await message.channel.send(messages.size.toString() + " messages were successfully deleted");
          bot.setTimeout(() => {
            if (!thing.deleted) thing.delete()
          }, 5000);
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
        await message.channel.send('That isn\'t a number!');
      } else if (number > 100) {
        await message.channel.send('I can only delete 100 messages at a time.');
      } else if (number < 1) {
        await message.channel.send('I don\'t think 0 or less is what you want to delete.');
      }
    }
  }
}