const Discord = require("discord.js");

module.exports = {
  run: async (bot, message, args) => {
    if (message.channel.type === "dm")
      return message.channel.send("This command only works on servers.");
    await message.guild.fetch();
    var servericon = message.guild.iconURL({ dynamic: true });
    const features = message.guild.features.join("\n");
    if (!features) {
      var features2 = "None";
    } else {
      var features2 = features;
    }

    const cat = message.guild.channels.cache.filter(c => c.type === "category")
      .size;
    var catname = "";
    if (cat == 1) {
      catname += "category";
    } else {
      catname += "categories";
    }

    let embedenabled;
    let embedchannel;
    if (message.guild.me.hasPermission("MANAGE_GUILD")) {
      let embeddata = await message.guild.fetchEmbed();
      embedenabled = embeddata.enabled;
      embedchannel = embeddata.channel;
    } else {
      embedenabled = message.guild.embedEnabled || message.guild.widgetEnabled
      embedchannel = message.guild.embedChannel || message.guild.widgetChannel
    }
    
    
    let invitenum = "";
    let bannumber = "";
    if (message.guild.id === "402555684849451028") {
      const bans = await message.guild.fetchBans();

      if (bans.first()) {
        bannumber = bans.size + " bans";
      } else {
        bannumber = "Without bans";
      }

      const invites = await message.guild.fetchInvites();

      if (invites.first()) {
        invitenum = invites.size + " invites";
      } else {
        invitenum = "Without invites";
      }
    }

    let links = [`[Guild](https://discord.com/channels/${message.guild.id})`];
    if (message.guild.splashURL()) {
      links.push(
        `[Invite Splash Image](${message.guild.splashURL({ format: "png", size: 1024 })})`
      );
    }
    if (message.guild.bannerURL()) {
      links.push(
        `[Banner Image](${message.guild.bannerURL({ format: "png", size: 1024 })})`
      );
    }
    if (embedenabled) {
      links.push(
        `[Widget](https://discord.com/widget?id=${message.guild.id}), [Widget Image](https://discord.com/api/v7/guilds/${message.guild.id}/widget.png)`
      );
    }

    const bots = message.guild.members.cache.filter(m => m.user.bot === true)
      .size;

    const rmembers = message.guild.memberCount - bots;

    const roles = message.guild.roles.cache.size;

    const mroles = message.guild.roles.cache.filter(r => r.managed === true)
      .size;

    const rroles = roles - mroles;

    const ae = message.guild.emojis.cache.filter(e => e.animated === true).size;

    const emojis = message.guild.emojis.cache.size - ae;

    const online = message.guild.members.cache.filter(
      m => m.user.presence.status === "online"
    ).size;

    const idle = message.guild.members.cache.filter(
      m => m.user.presence.status === "idle"
    ).size;

    const dnd = message.guild.members.cache.filter(
      m => m.user.presence.status === "dnd"
    ).size;

    const offline = message.guild.members.cache.filter(
      m => m.user.presence.status === "offline"
    ).size;

    const active = online + idle + dnd;

    const embed = new Discord.MessageEmbed()
      .setTitle("Server info")
      .setAuthor(message.guild.name, servericon)
      .addField(
        "Name",
        `${message.guild.name} (${message.guild.nameAcronym})`,
        true
      )
      .addField("ID", message.guild.id, true)
      .addField("Server Owner", message.guild.owner.user.tag, true)
      .addField("Server Create Date", message.guild.createdAt, true)
      .addField("Server Region", message.guild.region, true)
      .addField("Verification Level", message.guild.verificationLevel, true)
      .addField(
        "Member Count",
        `${message.guild.memberCount}\nHumans: ${rmembers}\n Bots: ${bots}`,
        true
      )
      .addField(
        "Channel Count",
        `${
          message.guild.channels.cache.filter(
            c => c.type === "text" || c.type === "voice"
          ).size
        } (${cat} ${catname})\nText = ${
          message.guild.channels.cache.filter(c => c.type === "text").size
        }\nVoice = ${
          message.guild.channels.cache.filter(c => c.type === "voice").size
        }`,
        true
      )
      .addField(
        "Emojis",
        `${message.guild.emojis.cache.size}\nNormal = ${emojis}\nAnimated = ${ae}`,
        true
      )
      .addField(
        "Roles",
        `${roles}\nNormal = ${rroles}\nManaged = ${mroles}`,
        true
      )
      .addField("Server Boost Level", message.guild.premiumTier, true)
      .addField("Boosts", message.guild.premiumSubscriptionCount, true)
      .addField("Features", features2, true)
      .addField("System Channel", message.guild.systemChannel, true)
      .addField("Widget Enabled?", embedenabled ? "Yes" + (embedchannel ? ", in " + embedchannel.toString() : "") : "No", true);
    if (message.guild.id === "402555684849451028") {
      embed
        .addField("Ban count", bannumber, true)
        .addField("Invite count", invitenum, true);
    }
    embed
      .addField(
        "Presence Count (" + active + " active on this server)",
        `**Online:** ${online}\n**Idle**: ${idle}\n**Do Not Disturb:** ${dnd}\n**Offline:** ${offline}`,
        true
      )
      .addField("Links", links.join(", "))
      .setThumbnail(message.guild.bannerURL({ format: "png", size: 128 }))
      .setImage(message.guild.splashURL({ format: "png", size: 128 }))
      .setColor("#FF00FF")
      .setTimestamp();
    if (message.guild.id === "402555684849451028") {
      let fetch = message.guild.roles.cache
        .get("402559343540568084")
        .members.map(m => m.user);
      let admins = fetch.join("\n");
      embed.addField("Admin List", admins);
      message.channel.send(embed);
    } else {
      message.channel.send(embed);
    }
  },
  aliases: [],
  description: "Server info"
};
