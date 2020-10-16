import Discord from "discord.js";

import MessageModel from "../../database/models/warn.js";

import MessageModel2 from "../../database/models/warn2.js";
import Command from "../../utils/command.js";

export default class extends Command {
  constructor(options) {
    super(options)

    this.description = "Warn a member";
    this.guildonly = true;
    this.permissions = {
      user: [4, 0],
      bot: [268435456, 0]
    };

  }
  async run(bot, message, args) {
    if (!args[1])
      return message.channel.send(
        "You haven't said anything. Put a member or `set`"
      );
    let msgDocument = await MessageModel.findOne({
      guildid: message.guild.id
    }).catch(err => console.log(err));
    if (!msgDocument) {
      try {
        var dbMsgModel = await MessageModel.create({ guildid: message.guild.id, role: false, roletime: 0, roleid: '0', kick: false, kicktime: 0, ban: false, bantime: 0 });
      } catch (err) {
        console.log(err);
      }
    } else {
      var dbMsgModel = msgDocument;
    }
    if (args[1] === "set") {
      if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(`you do not have permission to execute this command.`)
      if (!dbMsgModel) return console.log("Doesn't exist.");
      if (args[2] === "role") {
        if (!args[3]) return message.channel.send('First put the number of warnings to put the role, and then mention the role, write its ID or write its name. Set "false" to not use roles in this system.')
        if (args[3] === "false") {
          try {
            let form = await dbMsgModel.updateOne({ role: false });
         await message.channel.send("Okay, I'll not put a role.");
          } catch (err) {
            console.log(err);
            return message.channel.send(
              "I can't update my database info. Here's a debug: " + err
            );
          }
        } else {
          let warnings = parseInt(args[3]);
          let roleObj =
            message.mentions.roles.first() ||
            message.guild.roles.cache.get(args[4]) ||
            message.guild.roles.cache.find(
              r => r.name === args.slice(4).join(" ")
            );
          if (!isNaN(warnings)) {
            if (roleObj) {
              try {
                let form = await dbMsgModel.updateOne({
                  role: true,
                  roletime: warnings,
                  roleid: roleObj.id
                });
             await message.channel.send(
                  "Now I am going to put the role " +
                  roleObj.name +
                  " to the members that have " +
                  warnings +
                  " warning(s)"
                );
              } catch (err) {
                console.log(err);
                return message.channel.send(
                  "I can't update my database info. Here's a debug: " + err
                );
              }
            } else {
              return message.channel.send("That role isn't valid.");
            }
          } else {
            return message.channel.send(
              "That isn't a valid number of warnings"
            );
          }
        }
      } else if (args[2] === "kick") {
        if (!args[3]) return message.channel.send('Put the number of warnings necessary to kick the member.')
        if (args[3] === "false") {
          try {
            let form = await dbMsgModel.updateOne({ kick: false });
         await message.channel.send("I'll not kick anyone.");
          } catch (err) {
            console.log(err);
            return message.channel.send(
              "I can't update my database info. Here's a debug: " + err
            );
          }
        } else {
          let warnings = parseInt(args[3]);
          if (!isNaN(warnings)) {
            try {
              let form = await dbMsgModel.updateOne({
                kick: true,
                kicktime: warnings
              });
           await message.channel.send(
                "Now I'll kick members who have " + warnings + " warnings."
              );
            } catch (err) {
              console.log(err);
              return message.channel.send(
                "I can't update my database info. Here's a debug: " + err
              );
            }
          } else {
            return message.channel.send(
              "That isn't a valid number of warnings"
            );
          }
        }
      } else if (args[2] === "ban") {
        if (!args[3]) return message.channel.send('Put the number of warnings necessary to ban the member.')
        if (args[3] === "false") {
          try {
            let form = await dbMsgModel.updateOne({ ban: false });
         await message.channel.send("I'll not kick anyone.");
          } catch (err) {
            console.log(err);
            return message.channel.send(
              "I can't update my database info. Here's a debug: " + err
            );
          }
        } else {
          let warnings = parseInt(args[3]);
          if (!isNaN(warnings)) {
            try {
              let form = await dbMsgModel.updateOne({
                ban: true,
                bantime: warnings
              });
           await message.channel.send(
                "Now I'll ban members who have " + warnings + " warnings."
              );
            } catch (err) {
              console.log(err);
              return message.channel.send(
                "I can't update my database info. Here's a debug: " + err
              );
            }
          } else {
            return message.channel.send(
              "That isn't a valid number of warnings"
            );
          }
        }
      } else {
     await message.channel.send(
          "Usage: `warn set <role, kick, ban> <number or false> <role id (only role option)>`"
        );
      }
    } else {
      if (!dbMsgModel) return console.log("Doesn't exist.");
      let member =
        message.mentions.members.first() ||
        message.guild.members.cache.get(args[1]) || (args[1] ? await message.guild.members.fetch(args[1]).catch(err => { }) : undefined)
      if (!member) return message.channel.send("Invalid member!");
      let document = await MessageModel2.findOne({
        guildid: message.guild.id,
        memberid: member.id
      }).catch(err => console.log(err));
      if (!document) {
        try {
          let dbMsg = await new MessageModel2({ guildid: message.guild.id, memberid: member.id, warnings: 0 });
          var dbMsgModel2 = await dbMsg.save();
        } catch (err) {
          console.log(err);
        }
      } else {
        var dbMsgModel2 = document;
      }
      console.log(dbMsgModel2);
      if (dbMsgModel2) {
        try {
          let { warnings } = dbMsgModel2;
          let newWarnings = warnings + 1;
          let form = await dbMsgModel2.updateOne({ warnings: newWarnings });
          if (args[2]) {
            member.send(
              "You've been warned on " +
              message.guild.name +
              " with reason: " +
              args.slice(2).join(" ") +
              ". You have " +
              newWarnings +
              " warning(s)."
            );
         await message.channel.send(`I've warned ${member.user.tag} with reason: ${args.slice(2).join(" ")}. They now have ${newWarnings} warnings.`);
          } else {
            member.send(
              "You've been warned on " +
              message.guild.name +
              ". You have " +
              newWarnings +
              " warning(s)."
            );
         await message.channel.send(`I've warned ${member.user.tag}. They now have ${newWarnings} warnings.`);
          }
          let {
            role,
            roletime,
            roleid,
            kick,
            kicktime,
            ban,
            bantime
          } = dbMsgModel;
          if (role) {
            if (roletime <= newWarnings) {
              member.roles.add(roleid, "Too many warnings");
            }
          }
          if (kick) {
            if (kicktime == newWarnings) {
              member.kick("Too many warnings");
            }
          }
          if (ban) {
            if (bantime == newWarnings) {
              member.ban({ reason: "Too many warnings" });
            }
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        return message.channel.send("Something happened");
      }
    }
  }
}