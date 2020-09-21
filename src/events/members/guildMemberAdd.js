import MessageModel from "../../database/models/roles.js";
import MessageModel2 from "../../database/models/retreiveconfig.js";
import Discord from "discord.js";
export default async (bot, member) => {
  let verify = bot.rrcache.get(member.guild.id);
  if (!verify) {
    verify = await MessageModel2.findOne({ guildId: member.guild.id });
  }
  if (verify && verify.enabled) {
    let msgDocument = await MessageModel.findOne({
      guildid: member.guild.id,
      memberid: member.user.id
    });
    if (msgDocument) {
      if (member.guild.me.hasPermission("MANAGE_ROLES")) {
        let { roles } = msgDocument;
        let toadd = [];
        for (const r of roles) {
          let role = member.guild.roles.cache.get(r);
          if (role && !role.deleted && role.editable && !role.managed) {
            toadd.push(role.id);
          }
        }
        await member.roles.add(toadd, "Retrieving roles").catch(err => { });
      }
      msgDocument.deleteOne();
    }
  }

  const welcome = member.guild.cache.welcome ? member.guild.welcome : await member.guild.getWelcome();

  if (welcome) {
    let inviterMention = "Unknown";
    let inviterTag = "Unknown"
    try {
      if (((/%INVITER%/gmi.test(welcome.text)) || (/%INVITER%/gmi.test(welcome.dmmessage))) && member.guild.me.hasPermission("MANAGE_GUILD")) {
        const invitesBefore = member.guild.inviteCount
        const invitesAfter = await member.guild.getInviteCount();
        for (const inviter in invitesAfter) {
          if (invitesBefore[inviter] === (invitesAfter[inviter] - 1)) {
            inviterMention = (inviter === member.guild.id) ? "System" : ("<@!" + inviter + ">");
            if (inviter !== member.guild.id) {
              const t = bot.users.cache.get(inviter) || await bot.users.fetch(inviter).catch(err => { });
              if (t) inviterTag = t;
            } else {
              inviterTag = "System";
            }
          }
        }
        member.guild.inviteCount = invitesAfter;
      }
    } catch (err) {
      console.log(err);
      if (member.guild.me.hasPermission("MANAGE_GUILD")) {
        member.guild.inviteCount = await member.guild.getInviteCount();
      }
    } finally {
      if (welcome.enabled && welcome.text) {
        const channel = member.guild.channels.cache.get(welcome.channelID);
        if (channel && ["news", "text"].includes(channel.type) && channel.permissionsFor(member.guild.me).has(["VIEW_CHANNEL", "SEND_MESSAGES"])) {
          let finalText = welcome.text.replace(/%MEMBER%/gmi, member.toString()).replace(/%MEMBERTAG%/, member.user.tag).replace(/%MEMBERID%/, member.id).replace(/%SERVER%/gmi, member.guild.name).replace(/%INVITER%/gmi, inviterMention).replace(/%INVITERTAG%/gmi, inviterTag);
          await channel.send(finalText || "?").catch(err => { });
        }
      }
      if (welcome.dmenabled && welcome.dmtext) {
        let finalText = welcome.dmtext.replace(/%MEMBER%/gmi, member.toString()).replace(/%MEMBERTAG%/, member.user.tag).replace(/%MEMBERID%/, member.id).replace(/%SERVER%/gmi, member.guild.name).replace(/%INVITER%/gmi, inviterMention).replace(/%INVITERTAG%/gmi, inviterTag);
        await member.send(finalText || "?").catch(err => { });
      }
    }
  }
  //Things for Wow Wow Discord
  if (member.guild.id !== "402555684849451028") return;
  const embed = new Discord.MessageEmbed()
    .setTitle("Welcome to Wow Wow Discord!, " + member.user.username)
    .setColor("#FEE58D")
    .setThumbnail("https://cdn.discordapp.com/emojis/494666575773696001.png")
    .setDescription(
      `This server is dedicated to fans of the [Wow! Wow! Wubbzy!](https://wubbzy.fandom.com/wiki/Wow!_Wow!_Wubbzy!) show.\n\nIf you are one of them, we are happy to have you here! <:WubbzyLove:608130212076453928>`
    )
    .addField(
      "Yo soy alguien que habla español!",
      `Bienvenido a Wow Wow Discord, la comunidad de la serie infantil [Wow! Wow! Wubbzy!](https://wubbzy.fandom.com/es/wiki/Wow!_Wow!_Wubbzy!).\nPara obtener el rol español, espera los 10 minutos, ve a <#622977956863672362> y reacciona a [este mensaje](https://ptb.discordapp.com/channels/402555684849451028/622977956863672362/698991384140447765).\nEsperamos que disfrutes tu estancia en <#636781007189835779>`
    )
    .addField(
      "Why is the verification level high?",
      `This is to avoid raids with self-bots, and for people to read [the rules](https://ptb.discord.com/channels/402555684849451028/402556086093348874/402568434522521600) before chatting. We recommend reading the server rules to find out what is allowed and restricted. <#402556086093348874>`
    )
    .addField(
      "How do I get permissions to upload images and others?",
      `You must be chatting with us for a while before giving yourself those permissions. The level that will give you those permissions is level 2. (with me)\nYou can check your level by going to <#608560264425635850> and typing <:Gidget:610310249580331033>\`level\``
    )
    .addField(
      "Remember to use common sense!",
      `Not everything is covered by the rules. Following [Discord ToS](https://discord.com/terms) is an example of this, because everyone should know that.\n\nWe hope you have a friendly experience here! <:WubbzyHi:494666575773696001>`
    )
    .setFooter("Thanks for joining!")
    .setTimestamp();
  await member.send(embed).catch(err => { });
};
