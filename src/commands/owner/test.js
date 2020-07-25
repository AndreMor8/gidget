const Discord = require('discord.js');
const fs = require("fs");
const Canvas = require("canvas");
module.exports = {
    run: async (bot = new Discord.Client(), message = new Discord.Message(), args = []) => {
      if(!message.mentions.users.first()) return message.channel.send("Menciona a alguien"); 
    const user1 = message.mentions.users.first(2)[1] ? message.mentions.users.first().displayAvatarURL({ format: "png", size: 1024 }) : message.author.displayAvatarURL({ format: "png", size: 1024 });
    const user2 = message.mentions.users.first(2)[1] ? message.mentions.users.first(2)[1].displayAvatarURL({ format: "png", size: 1024 }) : message.mentions.users.first().displayAvatarURL({ format: "png", size: 1024 });
    const canvas = Canvas.createCanvas(1300, 375);
    const ctx = canvas.getContext('2d');
    // Ahora creas el primer arco para recortar el avatar. Este será el avatar de la izquierda.
    ctx.save()
    ctx.beginPath()
    ctx.arc(260, 185, 175, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.clip()

    // Ahora cargas la imágen de la izquierda, y la dibujas en las medidas del arco, así sale el avatar de la izquierda redondeado ;)
    const avatar1 = await Canvas.loadImage(user1)
    ctx.drawImage(avatar1, 40, 0, 400, 400)
    ctx.restore()

    // Ahora creas el segundo arco para recortar el avatar, este será el avatar de la derecha. :p
    ctx.save()
    ctx.beginPath()
    ctx.arc(1025, 185, 175, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.clip()

    // Ahora cargas el avatar de la derecha y lo dibujas en las medidas del arco de la derecha, así queda circular.
    const avatar2 = await Canvas.loadImage(user2)
    ctx.drawImage(avatar2, 830, 0, 400, 400)
    ctx.restore()

    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');

    message.channel.send(attachment);
    },
    aliases: [],
    secret: true,
    description: 'Some console.log tests',
}