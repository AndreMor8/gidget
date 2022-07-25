import { EmbedBuilder } from 'discord.js';
export default class extends Command {
	constructor(options) {
		super(options);
		this.description = "Thanks";
	}
	async run(bot, message) {
		const embed = new EmbedBuilder()
			.setTitle("Some of the people who helped in some way with this project =D")
			.addFields([
				{ name: "Awoo", value: "Current bot hosting, access to a free VPS :)" },
				{ name: "Ultriax", value: "Support server creation and design" },
				{ name: "GitHub", value: "[Those who contributed to the bot code](https://github.com/AndreMor8/gidget/graphs/contributors)" },
			])
			.setImage("https://contributors-img.web.app/image?repo=AndreMor8/gidget");
		await message.channel.send({ embeds: [embed] });
	}
}
