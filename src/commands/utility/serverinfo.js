import Discord from "discord.js";
export default class extends Command {
  constructor(options) {
    super(options)
    this.aliases = ["server"];
    this.description = "Server info";
    this.permissions = {
      user: [0, 0],
      bot: [0, 16384]
    };
  }
  async run(bot, message, args) {
    let broadcastedServer;
    if (!message.guild && !args[1]) return message.channel.send("Put a server ID!");
    let server = args[1] ? (bot.guilds.cache.get(args[1]) ||
      bot.guilds.cache.find(e => e.name === args.slice(1).join(" ")) ||
      bot.guilds.cache.find(e => e.name.toLowerCase() === args.slice(1).join(" ").toLowerCase()))
      : message.guild;
    if(!server) {
      broadcastedServer = args[1] ? (await bot.shard.fetchClientValues(`guilds.cache.map(e => e.toJSON())`)).find(e => e.find(a => a.name === args.slice(1).join(" ") || a.name.toLowerCase() === args.slice(1).join(" ").toLowerCase() || a.id === args[1]))?.find(a => a.name === args.slice(1).join(" ") || a.name.toLowerCase() === args.slice(1).join(" ").toLowerCase() || a.id === args[1]) : undefined;
      server = broadcastedServer ? (await bot.guilds.fetch(broadcastedServer.id, false).catch(() => {})) : undefined;
    }
    if(!server) {
      server = await bot.fetchGuildPreview(args[1]).catch(() => {});
    }
    if (!server) return message.channel.send("Invalid name/ID!\nSearch by name only works if the bot is on that server\nSearch by ID only works whether the bot is on that server or if it is a discoverable server");
    //if ((server instanceof Discord.Guild) && !server.available) return message.channel.send("That server is not available.\nPossibly the server is in an outage.");
    const servericon = server.iconURL({ dynamic: true, size: 4096 });
    //¯\_(ツ)_/¯
    const links = [`[Guild](https://discord.com/channels/${server.id})`];
    if (servericon) links.push(`[Server icon](${servericon})`);
    let embedenabled;
    let embedchannel;
    let catname = "";
    let invitenum = "";
    let bannumber = "";
    let roles;
    let mroles;
    let rroles;
    let ae;
    let emojis;
    /*
    let bots;
    let rmembers;
    let online;
    let idle;
    let dnd;
    let offline;
    let active;
    */
    if (server instanceof Discord.Guild) {
      const cat = server.channels.cache.filter(c => c.type === "category").size;
      if (cat == 1) {
        catname += "1 category";
      } else {
        catname += cat + " categories";
      }
      const embeddata = await server.fetchWidget().catch(() => { });
      if (embeddata) {
        embedenabled = embeddata.enabled;
        embedchannel = embeddata.channel;
      } else {
        embedenabled = server.embedEnabled || server.widgetEnabled
        embedchannel = server.embedChannel || server.widgetChannel
      }

      if ((message.guild ? message.guild.id === "402555684849451028" : false) && server.id === "402555684849451028") {
        const bans = await server.fetchBans();

        if (bans.first()) {
          bannumber = bans.size + " bans";
        } else {
          bannumber = "Without bans";
        }

        const invites = await server.fetchInvites();

        if (invites.first()) {
          invitenum = invites.size + " invites";
        } else {
          invitenum = "Without invites";
        }
      }
      if (server.bannerURL()) {
        links.push(
          `[Banner Image](${server.bannerURL({ format: "png", size: 4096 })})`
        );
      }
      if (embedenabled) {
        links.push(
          `[Widget](https://discord.com/widget?id=${server.id}), [Widget Image](https://discord.com/api/v7/guilds/${server.id}/widget.png)`
        );
      }
      const vanity = await server.fetchVanityData().catch(() => { });
      if (vanity && vanity.code) {
        links.push("[Vanity invite URL" + (vanity.uses ? (" (" + vanity.uses + " uses)") : "") + "](https://discord.gg/" + (vanity.code) + ")");
      } else if(server.vanityURLCode) {
        const vanity = {
          uses: server.vanityURLUses,
          code: server.vanityURLCode
        };
        links.push("[Vanity invite URL" + (vanity.uses ? (" (" + vanity.uses + " uses)") : "") + "](https://discord.gg/" + (vanity.code) + ")");
      }
      
      ae = server.emojis.cache.filter(e => e.animated === true).size;

      emojis = server.emojis.cache.size - ae;
      
      roles = server.roles.cache.size;

      mroles = server.roles.cache.filter(r => r.managed === true)
        .size;

      rroles = roles - mroles;
      /*
      bots = server.members.cache.filter(m => m.user.bot === true)
        .size;

      rmembers = server.memberCount - bots;

      online = server.members.cache.filter(
        m => m.user.presence.status === "online"
      ).size;

      idle = server.members.cache.filter(
        m => m.user.presence.status === "idle"
      ).size;

      dnd = server.members.cache.filter(
        m => m.user.presence.status === "dnd"
      ).size;

      offline = server.members.cache.filter(
        m => m.user.presence.status === "offline"
      ).size;

      active = online + idle + dnd;
      */
    }

    if (server.splashURL()) {
      links.push(
        `[Invite Splash Image](${server.splashURL({ format: "png", size: 4096 })})`
      );
    }

    if (server.discoverySplashURL()) {
      links.push("[Discovery Splash image](" + server.discoverySplashURL({ format: "png", size: 4096 }) + ")");
    }

    const embed = new Discord.MessageEmbed()
      .setTitle("Server info")
      .setAuthor(server.name, servericon)
      .addField("Name", `${server.name} ${(server instanceof Discord.Guild) ? (" (" + server.nameAcronym + ")") : ""}`, true)
      .addField("ID", server.id, true)
    if (server.description) {
      embed.addField("Description", server.description, true);
    }
    if (server instanceof Discord.Guild) {
      embed.addField("Server Owner", (server.owner.partial ? (await server.owner.fetch()).user.tag : server.owner.user.tag) + "\n" + server.owner.toString(), true)
        .addField("Server Create Date", global.botIntl.format(server.createdAt), true)
        .addField("Server Region", server.region, true)
        .addField("Verification Level", server.verificationLevel, true)
      if (server.rulesChannel) {
        embed.addField("Rules channel", server.rulesChannel.toString(), true);
      }
      if (server.publicUpdatesChannel) {
        embed.addField("Discord private updates", server.publicUpdatesChannel.toString(), true);
      }
      embed.addField("Member Count", server.memberCount?.toString() || (broadcastedServer ? broadcastedServer.memberCount?.toString() || "?" : "?"), true)
        .addField("Channel Count", `${server.channels.cache.filter(c => c.type === "text" || c.type === "voice").size} (${catname})\nText = ${server.channels.cache.filter(c => c.type === "text").size}\nVoice = ${server.channels.cache.filter(c => c.type === "voice").size}`, true)
        .addField("Emojis", `${server.emojis.cache.size}\nNormal = ${emojis}\nAnimated = ${ae}`, true)
        .addField("Roles", `${roles}\nNormal = ${rroles}\nManaged = ${mroles}`, true)
        .addField("Server Boost Level", server.premiumTier, true)
        .addField("Boosts", server.premiumSubscriptionCount, true)
      if (server.systemChannel) {
        embed.addField("System Channel", server.systemChannel.toString(), true);
      }
      embed.addField("Widget Enabled?", embedenabled ? "Yes" + (embedchannel ? ", in " + embedchannel.toString() : "") : "No", true)
        /*.addField("Presence Count (" + active + " active on this server)", `**Online:** ${online}\n**Idle**: ${idle}\n**Do Not Disturb:** ${dnd}\n**Offline:** ${offline}`, true)*/;
      if ((message.guild ? message.guild.id === "402555684849451028" : false) && server.id === "402555684849451028") {
        embed.addField("Ban count", bannumber, true)
          .addField("Invite count", invitenum, true);
      }
    }
    embed.addField("Features", server.features.join("\n") || "None", true)
      .addField("Links", links.join(", "))
      .setThumbnail((server instanceof Discord.Guild) ? server.bannerURL({ format: "png", size: 128 }) : server.discoverySplashURL({ format: "png", size: 128 }))
      .setImage(server.splashURL({ format: "png", size: 128 }))
      .setColor("#FF00FF")
      .setTimestamp();
    if ((message.guild ? message.guild.id === "402555684849451028" : false) && server.id === "402555684849451028") {
      const fetch = server.roles.cache.get("402559343540568084").members.map(m => m.user);
      const admins = fetch.join("\n");
      embed.addField("Admin List", admins);
   await message.channel.send(embed);
    } else {
   await message.channel.send(embed);
    }
  }
}
