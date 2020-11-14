
import Command from "../../utils/command.js";

export default class extends Command {
    constructor(options) {
        super(options)
        this.description = "the classic meme of batman and robin";
    }
    async run(bot, message, args) {
        let user = message.mentions.members.first() || message.guild.members.cache.get(args[1]) || message.member;
        const Discord = require('discord.js');
        const Canvas = require('canvas');
     
        const canvas = Canvas.createCanvas(770, 433);
        const ctx = canvas.getContext('2d');
     
        const background = await Canvas.loadImage('https://tvwriter.com/wp-content/uploads/2018/05/Batman-Slaps-Robin.jpg');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
     
        const avatar = await Canvas.loadImage(message.author.displayAvatarURL({ format: 'png' }));
          
        const avatarmen = await Canvas.loadImage(user.user.displayAvatarURL({format: 'png'}));
     
        ctx.drawImage(avatar,270, 50, 160, 160);
        ctx.drawImage(avatarmen, 452, 205, 160, 160);
     
        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'btslap.png');
          
        message.channel.send(attachment);



    
    
    
    }
