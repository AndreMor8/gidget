import { MessageCollector } from 'discord.js';
import MessageModel from '../../database/models/message.js';


let msgCollectorFilter = (newMsg, originalMsg) => newMsg.author.id === originalMsg.author.id;

export default class extends Command {
    constructor(options) {
        super(options);
        this.aliases = [];
        this.guildonly = true;
        this.description = "Role reaction system";
        this.permissions = {
            user: [8, 0],
            bot: [268435456, 0]
        };
    }
    async run(bot, message, args) {
        if (args.slice(1).length < 1) {
            let msg = await message.channel.send("Put the message ID");
            await msg.delete({ timeout: 3500 }).catch(err => console.log(err));
        } else if (args.slice(1).length > 1) {
            let msg = await message.channel.send("Too many arguments!");
            await msg.delete({ timeout: 3500 }).catch(err => console.log(err));
        }
        else {
            try {
                let fetchedMessage = await message.channel.messages.fetch(args[1]);
                if (fetchedMessage) {
                    await message.channel.send("Please provide all of the emoji names with the role name, one by one, separated with a comma.\ne.g: WubbzyWalk, A Wubbzy Fan, where the emoji name comes first, role name comes second.\nType `?done` when you finish.");
                    let collector = new MessageCollector(message.channel, msgCollectorFilter.bind(null, message));
                    let emojiRoleMappings = new Map();
                    collector.on('collect', msg => {
                        let { cache } = msg.guild.emojis;
                        if (msg.content.toLowerCase() === '?done') {
                            collector.stop('done command was issued.');
                            return;
                        }
                        let [emojiName, roleName] = msg.content.split(/,\s+/);
                        if (!emojiName && !roleName) return;
                        let emoji = cache.find(emoji => (emoji.toString() === emojiName) || (emoji.name.toLowerCase() === emojiName.toLowerCase()));
                        if (!emoji) {
                            if (/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gmi.test(emojiName)) {
                                emoji = emojiName;
                            } else {
                                msg.channel.send("Emoji does not exist. Try again.")
                                    .then(msg => msg.delete({ timeout: 2000 }))
                                    .catch(err => console.log(err));
                                return;
                            }
                        }
                        let role = msg.guild.roles.cache.find(role => role.name.toLowerCase() === roleName.toLowerCase());
                        if (!role) {
                            msg.channel.send("Role does not exist. Try again.")
                                .then(msg => msg.delete({ timeout: 2000 }))
                                .catch(err => console.log(err));
                            return;
                        }
                        fetchedMessage.react(emoji)
                            .then(() => console.log("Reacted."))
                            .catch(err => console.log(err));
                        emojiRoleMappings.set((emoji.id || emoji), role.id);
                    });
                    collector.on('end', async () => {
                        let findMsgDocument = await MessageModel
                            .findOne({ messageId: fetchedMessage.id, guildId: message.guild.id })
                            .catch(err => console.log(err));
                        if (findMsgDocument) {
                            console.log("The message exists.. Don't save...");
                            await message.channel.send("A role reaction set up exists for this message already...");
                        }
                        else {
                            let dbMsgModel = new MessageModel({
                                guildId: message.guild.id,
                                messageId: fetchedMessage.id,
                                emojiRoleMappings: emojiRoleMappings
                            });
                            dbMsgModel.save()
                                .then(async m => {
                                    console.log(m);
                                    bot.cachedMessageReactions.delete(fetchedMessage.id);
                                    await message.channel.send('I\'ve added that to my database.');
                                })
                                .catch(err => message.channel.send('Something happened when I tried to save the data to my database. Here\'s a debug: ' + err));
                        }
                    });
                }
            }
            catch (err) {
                console.log(err);
                let msg = await message.channel.send("Invalid ID. Message was not found :(");
                await msg.delete({ timeout: 3500 }).catch(err => console.log(err));
            }
        }
    }
}