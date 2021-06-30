import MessageModel from '../../database/models/message.js';
import { MessageCollector } from 'discord.js';
export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Role reaction system (Edit)";
        this.guildonly = true;
        this.permissions = {
            user: [8n, 0n],
            bot: [268435456n, 0n]
        };
    }
    async run(bot, message, args) {
        if (args.slice(1).length !== 1) return message.channel.send('Put the message ID.');
        // Check if the message exists.
        const { channel, author } = message;
        try {
            const fetchedMessage = channel.messages.cache.get(args[1]) || await channel.messages.fetch(args[1]);
            if (!fetchedMessage)
                channel.send("Message not found.");
            else {
                // Check if the message exists in the DB.
                const msgModel = await MessageModel.findOne({ messageId: fetchedMessage.id, guildId: message.guild.id });
                if (msgModel) {
                    // Prompt the user for configurations.
                    const filter = m => m.author.id === author.id && (m.content.toLowerCase() === 'add' || m.content.toLowerCase() === 'remove');
                    channel.send('If you are going to add more reaction-roles to that message, put `add`. To remove the configuration say `remove`');
                    try {
                        const awaitMsgOps = { filter, max: 1, time: 20000, errors: ['time'] };
                        const choice = (await channel.awaitMessages(awaitMsgOps)).first();
                        if (choice.content === "add") {
                            if (!message.guild.me.permissions.has("MANAGE_ROLES")) return message.channel.send("First give me the permissions to manage roles, okay?")
                            await channel.send("Enter an emoji name followed by the corresponding role name, separated with a comma. e.g: WubbzyWalk, A Wubbzy Fan\nType `?done` when you finish");
                            const collectorResult = await handleCollector(fetchedMessage, author, channel, msgModel);
                            msgModel.updateOne({ emojiRoleMappings: collectorResult }).then(() => {
                                bot.cachedMessageReactions.delete(fetchedMessage.id)
                                message.channel.send("Updated!").catch(() => { });
                            })
                        }
                        else if (choice.content === "remove") {
                            msgModel.deleteOne().then(async () => {
                                bot.cachedMessageReactions.set(fetchedMessage.id, false);
                                await message.channel.send('Ok. Removed.');
                            }).catch(err => message.channel.send('Some error ocurred. Here\'s a debug: ' + err));
                        } else {
                            await message.channel.send('Incorrect. Run this command again and say the correct parameters');
                        }
                    } catch (err) {
                        await message.channel.send('You haven\'t said anything. Please try the command again.');
                    }
                }
                else {
                    await message.channel.send("There is no configuration for that message. Please use `addrr` on a message to set up Role Reactions on that message.")
                }
            }
        }
        catch (err) {
            await message.channel.send("Some error ocurred. Here's a debug: " + err);
        }
    }
}
/**
 * @param fetchedMessage
 * @param author
 * @param channel
 * @param msgModel
 */
function handleCollector(fetchedMessage, author, channel, msgModel) {
    return new Promise((resolve) => {
        const collectorFilter = (m) => m.author.id === author.id;
        const collector = new MessageCollector(channel, { filter: collectorFilter });
        const emojiRoleMappings = new Map(Object.entries(msgModel.emojiRoleMappings));
        collector.on('collect', async msg => {
            if (msg.content.toLowerCase() === '?done') {
                collector.stop();
                resolve();
            }
            else {
                const allEmojis = await msg.guild.emojis.fetch();
                const [emojiName, roleName] = msg.content.split(/,\s+/);
                if (!emojiName && !roleName) return;
                let emoji = allEmojis.find(emoji => (emoji.toString() === emojiName) || (emoji.name.toLowerCase() === emojiName.toLowerCase()));
                if (!emoji) {
                    if (/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gmi.test(emojiName)) {
                        emoji = emojiName;
                    } else {
                        msg.channel.send("Emoji does not exist. Try again.")
                            .then(msg => msg.client.setTimeout(() => {
                                if (!msg.deleted) msg.delete();
                            }, 2000))
                            .catch(err => console.log(err));
                        return;
                    }
                }
                const role = msg.guild.roles.cache.get(roleName) || msg.guild.roles.cache.find(role => role.name.toLowerCase() === roleName.toLowerCase());
                if (!role) {
                    msg.channel.send("Role does not exist. Try again.")
                        .then(msg => msg.client.setTimeout(() => {
                            if (!msg.deleted) msg.delete();
                        }, 2000))
                        .catch(err => console.log(err));
                    return;
                }
                fetchedMessage.react(emoji)
                    .catch(err => console.log(err));
                emojiRoleMappings.set((emoji.id || emoji), role.id);
            }
        });
        collector.on('end', () => {
            resolve(emojiRoleMappings);
        });
    });
}