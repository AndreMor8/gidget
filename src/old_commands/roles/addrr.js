import { MessageCollector } from 'discord.js';
import MessageModel from '../../database/models/message.js';

const msgCollectorFilter = (newMsg, originalMsg) => newMsg.author.id === originalMsg.author.id;
//THIS WILL CHANGE TO A MORE SIMPLE LOGIC WHEN MOVED TO INTERACTIONS

export default class extends Command {
	constructor(options) {
		super(options);
		this.aliases = [];
		this.guildonly = true;
		this.description = "Role reaction system";
		this.permissions = {
			user: [8n, 0n],
			bot: [268435456n, 0n]
		};
	}
	async run(bot, message, args) {
		if (args.slice(1).length < 1) await message.channel.send("Put the message ID")
		else if (args.slice(1).length > 1) await message.channel.send("Too many arguments!")
		else {
			try {
				const allEmojis = await message.guild.emojis.fetch();
				const fetchedMessage = await message.channel.messages.fetch({ message: args[1] });
				if (fetchedMessage) {
					await message.channel.send(`Please, first mention the bot, after that, provide all of the emoji names with the role name, one by one, separated with a comma.\ne.g: \`@${bot.user.username} WubbzyWalk, A Wubbzy Fan\`, where the emoji name comes first, role name comes second.\nType \`@${bot.user.username} done\` when you finish.`);
					const collector = new MessageCollector(message.channel, { filter: msgCollectorFilter.bind(null, message) });
					const emojiRoleMappings = new Map();
					collector.on('collect', msg => {
						const PREFIX = `${bot.user.toString()} `;
						if (!msg.content.startsWith(PREFIX)) return;
						const argsMsg = msg.content.substring(PREFIX.length).trimEnd().split(/ +/g);
						if (argsMsg[0] === 'done') return collector.stop('done command was issued.')
						const [emojiName, roleName] = argsMsg.join(" ").split(/,\s+/);
						if (!emojiName) return;
						if (!roleName) return;
						let emoji = allEmojis.find(emoji => (emoji.toString() === emojiName) || (emoji.name.toLowerCase() === emojiName.toLowerCase()));
						if (!emoji) {
							if (/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gmi.test(emojiName)) {
								emoji = emojiName;
							} else {
								return msg.channel.send("Emoji does not exist. Try again.")
									.then(msg => setTimeout(() => { msg.delete().catch(() => { }); }, 2000))
									.catch(err => console.log(err));
							}
						}
						const role = msg.guild.roles.cache.get(roleName) || msg.guild.roles.cache.find(role => role.name.toLowerCase() === roleName.toLowerCase());
						if (!role) {
							msg.channel.send("Role does not exist. Try again.")
								.then(msg => setTimeout(() => {
									msg.delete().catch(() => { });
								}, 2000))
								.catch(err => console.log(err));
							return;
						}
						fetchedMessage.react(emoji).catch(err => console.log(err));
						emojiRoleMappings.set((emoji.id || emoji), role.id);
					});
					collector.on('end', async () => {
						const findMsgDocument = await MessageModel.findOne({ messageId: fetchedMessage.id, guildId: message.guild.id }).lean().exec();
						if (findMsgDocument) await message.channel.send("A role reaction set up exists for this message already...");
						else {
							await MessageModel.create({
								guildId: message.guild.id,
								messageId: fetchedMessage.id,
								emojiRoleMappings: emojiRoleMappings
							}).then(async () => {
								bot.cachedMessageReactions.delete(fetchedMessage.id);
								await message.channel.send('I\'ve added that to my database.');
							}).catch(err => message.channel.send('Something happened when I tried to save the data to my database. Here\'s a debug: ' + err));
						}
					});
				}
			}
			catch (err) {
				await message.channel.send("Invalid ID. Message was not found :(");
			}
		}
	}
}