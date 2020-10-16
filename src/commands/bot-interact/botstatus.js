//Needs rewrite
import Command from '../../utils/command.js';

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = 'Change the status or presence of the bot.';
  }
  async run(bot, message, args) {
    if(message.author.id !== "577000793094488085"){
      if(!message.guild) return message.channel.send('Only AndreMor or Wow Wow Discord administrators can use this command.')
      else if(message.guild.id !== "402555684849451028") return message.channel.send('Only AndreMor or Wow Wow Discord administrators can use this command.')
      else if(!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send('Only AndreMor or Wow Wow Discord administrators can use this command.')
    }
    if(!args[1]) return message.channel.send(`First put a a valid status, then a valid presence mode, then the text you want to appear.`)
    if(args[1] == "STREAMING") {
      if (!args[2]) {
        return message.channel.send('I need a stream link. Provide it.')
      } else if (!args[3]) {
        return message.channel.send('Put some text!')
      } else {
        bot.user.setPresence({ activity: { name: args.slice(3).join(" "), type: args[1], url: args[2] } }).catch(console.error);
        return message.channel.send('Presence changed!')
      }
    }
    if(args[1] != "online"){
      if(args[1] != "idle"){
        if(args[1] != "dnd"){
          if(args[1] != "invisible") {
            return message.channel.send('That status is not valid. Consult https://discord.js.org/#/docs/main/stable/typedef/PresenceStatusData for a list')
          }
        }
      }
    }
    if(!args[2] || args[2] === "--clear") {
      if(message.content.endsWith("--clear")) clearInterval(psi);
      bot.user.setPresence({ status: args[1] }).catch(console.error);
      if (args[1] == 'invisible'){
        return message.channel.send('Status changed! I\'m not slepping.')
      } else {
        return message.channel.send('Status changed!')
      }
    }
    if(args[2] == "CUSTOM_STATUS") return message.channel.send('Bots cannot put CUSTOM_STATUS!')
    if(args[2] == "STREAMING") return message.channel.send('<:Gidget:610310249580331033>`botstatus STREAMING <stream link> <text>`')
    if(args[2] != "PLAYING"){
      if(args[2] != "WATCHING") {
        if(args[2] != "LISTENING") {      
            return message.channel.send(`That is not a valid mode of presence. Consult https://discord.js.org/#/docs/main/stable/typedef/ActivityType for a list.`)
        }
      }
    }
    if(!args[3]) return message.channel.send('Put some text!')
    bot.user.setPresence({ activity: { name: args.slice(3).join(" "), type: args[2] }, status: args[1] }).catch(console.error);
    await message.channel.send('Presence changed!');
  }
}