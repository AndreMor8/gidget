const Discord = require("discord.js")
const math = require("math-expression-evaluator"); 

module.exports = {
  run: async (client, message, args, discord) => {
  if (!args[1]) return message.channel.send('Put something to calculate!')
    
  const embed = new Discord.MessageEmbed()
  .setTitle("📊 Calculator")
  .setColor(`RANDOM`);
  let result;
  try {
    result = math.eval(args.slice(1).join(" "));
  } catch (e) {
    result = `${e.message}`;
  }
  embed.addField("Input:", `\`\`\`js\n${args.slice(1).join(" ")}\`\`\``)
  .addField("Output", `\`\`\`js\n${result}\`\`\``);
  message.channel.send(embed);
},
aliases: [],
description: "Calculate something",
permissions: {
  user: [0, 0],
  bot: [0, 16384]
}
}
  