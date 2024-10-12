import MessageModel from "../../database/models/roles.js";
import MessageModel2 from "../../database/models/retreiveconfig.js";
import tempmuteconfig from '../../database/models/muterole.js';
import tempmute from '../../database/models/mutedmembers.js';
import tempmutesystem from '../../utils/tempmute.js';
import Discord from "discord.js";
import { getWelcome, getInviteCount, setWelcome } from "../../extensions.js";

export default async (bot, member) => {

  //RETRIVING ROLES
  let verify = bot.rrcache.get(member.guild.id);
  if (!verify) {
    verify = await MessageModel2.findOne({ guildId: member.guild.id }).lean();
  }
  if (verify && verify.enabled) {
    const msgDocument = await MessageModel.findOne({
      guildid: member.guild.id,
      memberid: member.user.id
    }).lean();
    if (msgDocument) {
      if (member.guild.members.me.permissions.has("ManageRoles")) {
        const { roles } = msgDocument;
        const col = member.guild.roles.cache.filter(role => roles.includes(role.id) && (role.editable && !role.managed));
        if (col.size >= 1) await member.roles.add(col, "Retrieving roles").catch(() => { });
      }
      MessageModel.findByIdAndDelete(msgDocument._id.toString()).lean().exec();
    }
    bot.rrcache.set(member.guild.id, verify);
  }

  //TEMPMUTE -> PERSIST
  const data = await tempmute.findOne({ memberId: { $eq: member.id }, guildId: { $eq: member.guild.id } }).lean();
  if (data && (Date.now() < data.date.getTime())) {
    const guildData = await tempmuteconfig.findOne({ guildid: { $eq: member.guild.id } }).lean();
    if (guildData) {
      if (member.guild.members.me.permissions.has("ManageRoles")) {
        member.roles.add(guildData.muteroleid, "Temprestrict - Persist").catch(() => { });
      }
    }
    tempmutesystem(bot, true);
  } else if (data && (Date.now() > data.date.getTime())) {
    await tempmute.deleteOne({ memberId: { $eq: member.id }, guildId: { $eq: member.guild.id } });
    tempmutesystem(bot, true);
  }

  //WELCOME SYSTEM
  const welcome = await getWelcome(member.guild);

  if (welcome) {
    let inviterMention = "Unknown";
    let inviterTag = "Unknown";
    let inviterId = "Unknown";
    try {
      if (((/%INVITER%/gmi.test(welcome.text)) || (/%INVITER%/gmi.test(welcome.dmmessage))) && member.guild.members.me.permissions.has("ManageGuild")) {
        const invitesBefore = member.guild.inviteCount;
        const invitesAfter = await getInviteCount(member.guild);
        for (const inviter in invitesAfter) {
          if (invitesBefore[inviter] === (invitesAfter[inviter] - 1)) {
            inviterMention = (inviter === member.guild.id) ? "System" : ("<@!" + inviter + ">");
            inviterId = inviter;
            if (inviter !== member.guild.id) {
              const t = bot.users.cache.get(inviter) || await bot.users.fetch(inviter).catch(() => { });
              if (t) inviterTag = t.tag;
            } else {
              inviterTag = "System";
            }
            if (welcome.respectms) bot.savedInvites.set(member.id, { inviterMention, inviterTag, inviterId });
          }
        }
        member.guild.inviteCount = invitesAfter;
      }
    } catch (err) {
      console.log(err);
      if (member.guild.members.me.permissions.has("ManageGuild")) {
        member.guild.inviteCount = await getInviteCount(member.guild).catch(console.log);
      }
    } finally {
      if (!welcome.respectms) {
        if (welcome.enabled && (welcome.channelID && welcome.text)) {
          const channel = await member.guild.channels.fetch(welcome.channelID).catch(() => { });
          if (channel && channel.isTextBased() && channel.permissionsFor(bot.user.id).has(["ViewChannel", "SendMessages"])) {
            const finalText = welcome.text.replace(/%MEMBER%/gmi, member.toString()).replace(/%MEMBERTAG%/, member.user.tag).replace(/%MEMBERID%/, member.id).replace(/%SERVER%/gmi, member.guild.name).replace(/%INVITER%/gmi, inviterMention).replace(/%INVITERTAG%/gmi, inviterTag).replace(/%INVITERID%/gmi, inviterId).replace(/%MEMBERCOUNT%/, member.guild.memberCount);
            await channel.send(finalText || "?", { allowedMentions: { users: [member.id] } }).catch(() => { });
          } else await setWelcome(member.guild, 1, null);
        }
        if (welcome.dmenabled && welcome.dmtext) {
          const finalText = welcome.dmtext.replace(/%MEMBER%/gmi, member.toString()).replace(/%MEMBERTAG%/, member.user.tag).replace(/%MEMBERID%/, member.id).replace(/%SERVER%/gmi, member.guild.name).replace(/%INVITER%/gmi, inviterMention).replace(/%INVITERTAG%/gmi, inviterTag).replace(/%INVITERID%/gmi, inviterId).replace(/%MEMBERCOUNT%/, member.guild.memberCount);
          await member.send(finalText || "?").catch(() => { });
        }
        if (welcome.roleID) {
          const role = await member.guild.roles.fetch(welcome.roleID).catch(() => { });
          if (role && role.editable) {
            await member.roles.add(role, "Welcome system").catch(() => { });
          } else await setWelcome(member.guild, 8, null);
        }
      }
    }
  }

  //Things for Wow Wow Discord
  if (member.guild.id !== "402555684849451028") return;
  const embed = new Discord.EmbedBuilder()
    .setTitle("Welcome to Wow Wow Discord!, " + member.user.username)
    .setColor("#FEE58D")
    .setThumbnail("https://cdn.discordapp.com/emojis/494666575773696001.png")
    .setDescription(`This server is dedicated to fans of the [Wow! Wow! Wubbzy!](https://wubbzy.fandom.com/wiki/Wow!_Wow!_Wubbzy!) show.\n\nIf you are one of them, we are happy to have you here! <:WubbzyLove:608130212076453928>`)
    .addFields([
      { name: "Yo soy alguien que habla español!", value: `Bienvenido a Wow Wow Discord, la comunidad de la serie infantil [Wow! Wow! Wubbzy!](https://wubbzy.fandom.com/es/wiki/Wow!_Wow!_Wubbzy!).\nPara obtener el rol español, espera los 10 minutos, ve a <#861108000873512970> y selecciona el respectivo rol en [este mensaje](https://discord.com/channels/402555684849451028/861108000873512970/861116424935964712).\nEsperamos que disfrutes tu estancia en <#636781007189835779>` },
      { name: "Why is the verification level high?", value: `This is to avoid raids with self-bots, and for people to read [the rules](https://discord.com/channels/402555684849451028/402556086093348874/402568434522521600) before chatting. We recommend reading the server rules to find out what is allowed and restricted. <#402556086093348874>` },
      { name: "How do I get permissions to upload images and others?", value: `You must be chatting with us for a while before giving yourself those permissions. The level that will give you those permissions is level 2 (with me).\nYou can check your level by going to <#608560264425635850> and typing <:Gidget:610310249580331033>\`level\`` },
      { name: "Remember to use common sense!", value: `Not everything is covered by the rules. Following [Discord ToS](https://discord.com/terms) is an example of this, because everyone should know that.\n\nWe hope you have a friendly experience here! <:WubbzyHi:494666575773696001>` }
    ])
    .setFooter({ text: "Thanks for joining!" })
    .setTimestamp();
  await member.send({ embeds: [embed] }).catch(() => { });
};
