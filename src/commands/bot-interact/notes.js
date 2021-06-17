//Rewrite
import notes from '../../database/models/notes.js';
import Discord from 'discord.js';

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "A simple notes system :)";
  }
  async run(bot, message, args) {
    if (args[1] === "add") {
      if (!args[2]) return await message.channel.send("Put some text!");
      if ((await notes.find({ userID: { $eq: message.author.id } })).length >= 25) return message.channel.send("You can only have 25 notes.");
      if(args.slice(2).join(" ").length > 230) return message.channel.send("Only 230 characters per note.");
      await notes.create({
        userID: message.author.id,
        note: args.slice(2).join(" ")
      });
      await message.channel.send("I've created your note successfully.");
    } else if (args[1] === "remove") {
        if (!args[2]) return await message.channel.send("Put the note ID or put `all` to delete all your notes");
        if (args[2] === "all") {
          const results = await notes.deleteMany({ userID: { $eq: message.author.id } });
          await message.channel.send(`I have deleted ${results.n} notes of yours.`);
        } else {
          const o = parseInt(args[2]);
          if (!o) return await message.channel.send("Invalid ID!");
          const arr = await notes.find({ userID: { $eq: message.author.id } });
          const i = o - 1;
          if (!arr[i]) return await message.channel.send("That note ID does not exist.");
          await arr[i].deleteOne();
          await message.channel.send("I've deleted that note");
        }
    } else if (args[1] === "update") {
        if (!args[2]) return await message.channel.send("Put the note ID you want to update");
        else {
          const o = parseInt(args[2]);
          if (!o) return await message.channel.send("Invalid ID!");
          const arr = await notes.find({ userID: { $eq: message.author.id } });
          const i = o - 1;
          if (!arr[i]) return await message.channel.send("That note ID does not exist.");
          if (!args[3]) return await message.channel.send("Put some text!");
          if (args.slice(3).join(" ").length > 230) return message.channel.send("Only 230 characters per note.");
          await arr[i].updateOne({ $set: { note: args.slice(3).join(" ") } });
          await message.channel.send("I've updated that note");
        }
    } else {
        const arr = await notes.find({ userID: { $eq: message.author.id } });
        if (!arr[0]) return await message.channel.send("You don't have notes");

        const embed = new Discord.MessageEmbed()
          .setTitle("Notes from " + message.author.username)
          .setColor("BLUE")
          .setTimestamp();

        for(const i in arr) {
          embed.addField(`${parseInt(i) + 1}.`, arr[i].note);
        }

        await message.channel.send({embeds: [embed]});
    }
  }
}