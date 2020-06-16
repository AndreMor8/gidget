const Discord = require("discord.js");

module.exports = {
  run: async (bot, message, args) => {
    if (message.author.id !== "577000793094488085") return message.channel.send('Only AndreMor can use this command')
    if (!args[1]) return message.channel.send("Put something to evaluate.");
    let limit = 1005;
    let code = args.slice(1).join(' ');
    try {
      let evalued = await eval(code);
      if (typeof evalued !== "string")
        evalued = require("util").inspect(evalued, { depth: 0 });
      let txt = "" + evalued;
      if (txt.length > limit) {
        const embed = new Discord.MessageEmbed()
        .setAuthor("Evaluation done!", bot.user.displayAvatarURL())
        .addField("Input", `\`\`\`js\n${code}\n\`\`\``)
        .addField("Output", `\`\`\`js\n ${txt.slice(0, limit)}\n\`\`\``)
        .setColor("RANDOM")
        .setFooter("Requested by: "+message.author.tag)
        message.channel.send(embed);
      } else {
        var embed = new Discord.MessageEmbed()
          .setAuthor("Evaluation done!", bot.user.displayAvatarURL())
          .addField("Input", `\`\`\`js\n${code}\n\`\`\``)
          .addField("Output", `\`\`\`js\n ${txt}\n\`\`\``)
          .setColor("RANDOM")
          .setFooter("Requested by: " + message.author.tag)
        message.channel.send(embed);
      }
    } catch (err) {
      const embed = new Discord.MessageEmbed()
      .setAuthor("Something happened!", bot.user.displayAvatarURL())
      .addField("Input", `\`\`\`js\n${code}\n\`\`\``)
      .addField("Output", `\`\`\`js\n${err}\n\`\`\``)
      .setColor("RANDOM")
      .setFooter("Requested by: "+message.author.tag)
      message.channel.send(embed);
  }
  },
  aliases: ["ev"],
  secret: true,
  description: "Eval a code via command"
};
