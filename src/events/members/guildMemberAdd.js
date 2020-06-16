const MessageModel = require("../../database/models/roles");
const MessageModel2 = require("../../database/models/retreiveconfig");
const Discord = require("discord.js");
module.exports = async (bot, member) => {
  let error = 0;
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
      let { roles } = msgDocument;
      let toadd = [];
      roles.forEach(r => {
        let role = member.guild.roles.cache.get(r);
        if (role && !role.deleted && role.editable && !role.managed) {
          toadd.push(role.id);
        }
      });
      member.roles.add(toadd, "Retrieving roles");
      msgDocument.deleteOne();
    }
  }
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
      `This is to avoid raids with self-bots, and for people to read [the rules](https://ptb.discordapp.com/channels/402555684849451028/402556086093348874/402568434522521600) before chatting. We recommend reading the server rules to find out what is allowed and restricted. <#402556086093348874>`
    )
    .addField(
      "How do I get permissions to upload images and others?",
      `You must be chatting with us for a while before giving yourself those permissions. The level that will give you those permissions is level 2. (with Gaius Play bot)\nYou can check your level by going to <#608560264425635850> and typing \`-level\``
    )
    .addField(
      "Remember to use common sense!",
      `Not everything is covered by the rules. Following [Discord ToS](https://discordapp.com/terms) is an example of this, because everyone should know that.\n\nWe hope you have a friendly experience here! <:WubbzyHi:494666575773696001>`
    )
    .setFooter("Thanks for joining!")
    .setTimestamp();
  try {
    await member.send(embed);
    const channel = member.guild.channels.cache.get("402555684849451030");
    if (!channel) return;

    if (error !== 1) {
      channel.send(
        `Welcome to Wow Wow Discord ${member}! <a:WubbzyFaceA:612311062611492900> While you wait 10 minutes before chatting here, check <#402556086093348874> to enjoy this server correctly. <:WubbzyLove:608130212076453928>. Remember to read the DM that I send you :)`
      );
    } else {
      channel.send(
        `Welcome to Wow Wow Discord ${member}! <a:WubbzyFaceA:612311062611492900> While you wait 10 minutes before chatting here, check <#402556086093348874> to enjoy this server correctly. <:WubbzyLove:608130212076453928>. Your DMs are closed :(`
      );
    }
  } catch (err) {
    error = 1;
    console.log(err);
  }
};
