//Needs update
import commons from '../../utils/commons.js';
const { __dirname } = commons(import.meta.url);
import Command from '../../utils/command.js';
import Discord from 'discord.js';
import MeowDB from 'meowdb';
const notes = new MeowDB({
    dir: __dirname,
    name: "notes"
});
export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "A simple notes system :)";
  }
  async run(bot, message, args) {
    if(args[1] === "add") {
      if (!args[2]) return await message.channel.send("Put some text!");
      if(notes.exists(message.author.id)) {
        const arr = notes.get(message.author.id);
        arr.push(args.slice(2).join(" ").replace(/(\r\n|\n|\r)/gm, " "));
        notes.set(message.author.id, arr);
        await message.channel.send("I've added the new note");
      } else {
        notes.create(message.author.id, [args.slice(2).join(" ")]);
        await message.channel.send("I've added the new note");
      }
    } else if (args[1] === "remove") {
      if(notes.exists(message.author.id)) {
        if (!args[2]) return await message.channel.send("Put the note ID or put `all` to delete all your notes");
        if (args[2] === "all") {
          notes.delete(message.author.id);
          await message.channel.send("I've deleted all your notes.");
        } else {
          const arr = notes.get(message.author.id);
          let o = parseInt(args[2])
          if(!o) return await message.channel.send("Invalid ID!")
          let i = o - 1;
          if(!arr[i]) return await message.channel.send("That note ID does not exist.");
          arr.splice(i, 1);
          notes.set(message.author.id, arr);
          await message.channel.send("I've deleted that note");
        }
      } else return await message.channel.send("You don't have notes");
    } else if (args[1] === "update") {
      if(notes.exists(message.author.id)) {
        if (!args[2]) return await message.channel.send("Put the note ID you want to update");
        else {
          const arr = notes.get(message.author.id);
          let o = parseInt(args[2]);
          if(!o) return await message.channel.send("Invalid ID!")
          let i = o - 1;
          if(!arr[i]) return await message.channel.send("That note ID does not exist.");
          if (!args[3]) return await message.channel.send("Put some text!");
          arr[i] = args.slice(3).join(" ").replace(/(\r\n|\n|\r)/gm, " ");
          notes.set(message.author.id, arr);
          await message.channel.send("I've updated that note");
        }
      } else return await message.channel.send("You don't have notes");
    } else {
      if(notes.exists(message.author.id)) {
        const arr = notes.get(message.author.id);
        if(!arr[0]) return await message.channel.send("You don't have notes")
        let text = "";
        let i = 0;
        arr.forEach(r => {
          i++
          text += i + ". " + r + "\n";
        })
        const embed = new Discord.MessageEmbed()
        .setTitle("Notes from " + message.author.username)
        .setDescription(text)
        .setColor("BLUE")
        .setFooter("Powered by MeowDB")
        .setTimestamp();
        await message.channel.send(embed);
      }
      else return await message.channel.send("You don't have notes");
    }
  }
}