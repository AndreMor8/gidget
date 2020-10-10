import Command from '../../utils/command.js';
import Discord from 'discord.js';
export default class extends Command {
	constructor(options) {
		super(options);
		this.description = "User avatar";
		this.permissions = {
			user: [0, 0],
			bot: [0, 16384]
		};
	}
	async run(message, args) {
		if(args[1] === "server") {
			if(!message.guild) return message.channel.send("This sub-command only works on servers");
			if(!message.guild.icon) return message.channel.send("This server doesn't have an avatar");
			await message.channel.send(new Discord.MessageEmbed()
			.setTitle(`${message.guild.name}'s avatar`)
			.setImage(message.guild.iconURL({ format: "png", dynamic: true, size: 4096 })));
		}
		const user = message.mentions.users.first() || this.bot.users.cache.get(args[1]) || this.bot.users.cache.find(e => (e.username === args.slice(1).join(" ") || (e.tag === args.slice(1).join(" ")))) || (message.guild ? (message.guild.members.cache.find(e => (e.nickname === args.slice(1).join(" ")))) : undefined) || message.author;
		if(user instanceof Discord.GuildMember) {
			user = user.user;
		}
		await message.channel.send(new Discord.MessageEmbed()
		.setTitle((user.id === message.author.id) ? `Your avatar` : `${user.tag}'s avatar`)
		.setImage(user.displayAvatarURL({ dynamic: true, size: 4096, format: "png" })));
	}
}