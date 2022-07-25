import Discord from 'discord.js';
export default class extends Command {
	constructor(options) {
		super(options);
		this.description = "User avatar";
		this.permissions = {
			user: [0n, 0n],
			bot: [0n, 16384n]
		};
	}
	async run(bot, message, args) {
		if (args[1] === "server") {
			if (!message.guild) return message.channel.send("This sub-command only works on servers");
			if (!message.guild.icon) return message.channel.send("This server doesn't have an avatar");
			return message.channel.send({
				embeds: [new Discord.EmbedBuilder()
					.setTitle(`${message.guild.name}'s avatar`)
					.setImage(message.guild.iconURL({ extension: "png",  size: 4096 }))]
			});
		}
		let user = message.mentions.users.filter(u => u.id !== bot.user.id).first() || bot.users.cache.get(args[1]) || bot.users.cache.find(e => (e.username === args.slice(1).join(" ") || (e.tag === args.slice(1).join(" ")))) || (message.guild ? (message.guild.members.cache.find(e => (e.nickname === args.slice(1).join(" ")))) : undefined) || (args[1] ? await bot.users.fetch(args[1]).catch(() => { }) : undefined) || message.author;
		if (user.user) user = user.user;
		await message.channel.send({
			embeds: [new Discord.EmbedBuilder()
				.setTitle((user.id === message.author.id) ? `Your avatar` : `${user.tag}'s avatar`)
				.setImage(user.displayAvatarURL({  size: 4096, extension: "png" }))]
		});
	}
}
