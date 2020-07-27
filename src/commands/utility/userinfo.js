//Rewrite
const Discord = require("discord.js");

module.exports = {
  run: async (bot, message, args) => {
    const status = {
      online: "Online",
      idle: "Idle",
      dnd: "Do Not Disturb",
      offline: "Offline/Invisible"
    };
    const desktop = {
      online: "Desktop => Online",
      idle: "Desktop => Idle",
      dnd: "Desktop => Do Not Disturb"
    };
    const web = {
      online: "Web => Online",
      idle: "Web => Idle",
      dnd: "Web => Do Not Disturb"
    };
    const mobile = {
      online: "Mobile => Online",
      idle: "Mobile => Idle",
      dnd: "Mobile => Do Not Disturb"
    };
    const ptype = {
      PLAYING: "Playing ",
      LISTENING: "Listening ",
      WATCHING: "Watching ",
      STREAMING: "Streaming ",
      CUSTOM_STATUS: "Custom status:"
    };

    let user =
      message.mentions.users.first() ||
      bot.users.cache.get(args[1]) ||
      bot.users.cache.find(m => m.tag === args.slice(1).join(" ")) ||
      bot.users.cache.find(m => m.username === args.slice(1).join(" "));
    if (!args[1]) user = message.author;
    if (!user) {
      if (
        message.guild &&
        message.guild.members.cache.find(
          m => m.nickname === args.slice(1).join(" ")
        )
      ) {
        user = message.guild.members.cache.find(
          m => m.nickname === args.slice(1).join(" ")
        ).user;
      } else {
        try {
          const fetch = await bot.users.fetch(args[1]);
          user = fetch;
          if (!user) return message.channel.send("Invalid member!");
        } catch (err) {
          return message.channel.send("Invalid member!");
        }
      }
    }
    var status2 = "";
    if (user.presence.clientStatus) {
      if (user.presence.clientStatus["web"]) {
        status2 += web[user.presence.clientStatus["web"]] + "\n";
      }
      if (user.presence.clientStatus["mobile"]) {
        status2 += mobile[user.presence.clientStatus["mobile"]] + "\n";
      }
      if (user.presence.clientStatus["desktop"]) {
        status2 += desktop[user.presence.clientStatus["desktop"]] + "\n";
      }
    } else {
      status2 = status[user.presence.status];
    }
    if (!status2) status2 = "Offline/Invisible";
    var ptext = "";
    if (user.presence.activities && user.presence.activities[0]) {
      for (const npresence of Object.values(user.presence.activities)) {
        if (
          npresence.name == "Custom Status" ||
          npresence.type == "CUSTOM_STATUS"
        ) {
          ptext += ptype[npresence.type] + "\n";
          if (npresence.emoji) ptext += npresence.emoji.toString() + " ";
          if (npresence.state) ptext += npresence.state;
          ptext += "\n";
        } else {
          ptext += ptype[npresence.type] + npresence.name;
          if (npresence.details) {
            ptext += "\nDetails: " + npresence.details;
          }
          if (npresence.state) {
            ptext += "\n" + npresence.state;
          }
          if (npresence.party) {
            if (npresence.party.size)
              ptext +=
                "\nParty: " +
                npresence.party.size[0] +
                "/" +
                npresence.party.size[1];
          }
          if (npresence.assets) {
            if (npresence.assets.largeText)
              ptext += "\n" + npresence.assets.largeText;
            if (npresence.assets.smallText)
              ptext += "\n" + npresence.assets.smallText;
          }
          ptext += "\n";
        }
      }
    } else ptext = "None";

    let flagtext = "Without flags";

    if (user.flags) {
      if (user.flags.toArray()) {
        if (user.flags.toArray().join("\n")) {
          flagtext = user.flags.toArray().join("\n");
        }
      }
    }

    const embed = new Discord.MessageEmbed()
      .setAuthor(user.username, user.displayAvatarURL({ dynamic: true }))
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setTitle(`Information about ${user.username}`)
      .setColor("#00ff00")
      .setTimestamp();

    if (message.guild) {
      try {
        const member = await message.guild.members.fetch(user);

        const perms = member.permissions.toArray();
        let permstext = "";
        if (perms.indexOf("ADMINISTRATOR") === -1) {
          permstext = perms.join(", ") || "Without permissions.";
        } else {
          permstext = "ADMINISTRATOR (All permissions)";
        }
        const perms2 = member.permissionsIn(message.channel).toArray();
        let permstext2 = "";
        if (perms2.indexOf("ADMINISTRATOR") === -1) {
          permstext2 = perms2.join(", ") || "Without permissions.";
        } else {
          permstext2 = "ADMINISTRATOR (All permissions)";
        }

        embed
          .addField("Full Username", user.tag + "\n" + user.toString(), true)
          .addField("ID", user.id, true)
          .addField(
            "Nickname",
            member.nickname ? `${member.nickname}` : "None",
            true
          )
          .addField("Bot?", user.bot ? "Yes" : "No", true)
          .addField("Status", status2, true)
          .addField("Presence", ptext, true)
          .addField("Permissions (General)", `\`${permstext}\``, true)
          .addField("Permissions (Overwrites)", `\`${permstext2}\``, true)
          .addField("Flags", `\`${flagtext}\``, true)
          .addField(
            "Last Message",
            user.lastMessage ? user.lastMessage.url : "Without fetch about that"
          )
          .addField(
            "Boosting?",
            member.premiumSince
              ? `Yes, since ${member.premiumSince.toLocaleString("en-US", {
                  dateStyle: "short",
                  timeStyle: "medium",
                  hour12: true
                })}`
              : "No"
          )
          .addField(
            `Joined ${message.guild.name} at`,
            member.joinedAt.toLocaleString("en-US", {
              dateStyle: "short",
              timeStyle: "medium",
              hour12: true
            })
          )
          .addField(
            "Joined Discord At",
            user.createdAt.toLocaleString("en-US", {
              dateStyle: "short",
              timeStyle: "medium",
              hour12: true
            })
          )
          .addField(
            "Roles",
            `${member.roles.cache
              .filter(r => r.id !== message.guild.id)
              .map(roles => `${roles}`)
              .join(" **|** ") || "No Roles"}`
          );
        message.channel.send(embed);
      } catch (err) {
        embed
          .addField("Full Username", user.tag, true)
          .addField("ID", user.id, true)
          .addField("Bot?", user.bot ? "Yes" : "No", true)
          .addField("Status", status2, true)
          .addField("Presence", ptext, true)
          .addField("Flags", `\`${flagtext}\``, true)
          .addField(
            "Last Message",
            user.lastMessage ? user.lastMessage.url : "Without fetch about that"
          )
          .addField(
            "Joined Discord At",
            user.createdAt.toLocaleString("en-US", {
              dateStyle: "short",
              timeStyle: "medium",
              hour12: true
            })
          );
        message.channel.send(embed);
      }
    } else {
      embed
        .addField("Full Username", user.tag, true)
        .addField("ID", user.id, true)
        .addField("Bot?", user.bot ? "Yes" : "No", true)
        .addField("Status", status2, true)
        .addField("Presence", ptext, true)
        .addField("Flags", `\`${flagtext}\``, true)
        .addField(
          "Last Message",
          user.lastMessage ? user.lastMessage.url : "Without fetch about that"
        )
        .addField(
          "Joined Discord At",
          user.createdAt.toLocaleString("en-US", {
            dateStyle: "short",
            timeStyle: "medium",
            hour12: true
          })
        );
      message.channel.send(embed);
    }
  },
  aliases: [],
  description: "User info"
};
