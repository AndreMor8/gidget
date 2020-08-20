const MessageModel = require('../../database/models/message');
const { MessageCollector } = require('discord.js');
const Discord = require('discord.js');

module.exports = {
    run: async (bot, message, args) => {
        if (args.slice(1).length !== 1) return message.channel.send('Put the message ID.');
        // Check if the message exists.
        const { channel, author } = message;
        try {
            let fetchedMessage = channel.messages.cache.get(args[1]) || await channel.messages.fetch(args[1]);
            if (!fetchedMessage)
                channel.send("Message not found.");
            else {
                // Check if the message exists in the DB.
                let msgModel = await MessageModel.findOne({ messageId: fetchedMessage.id, guildId: message.guild.id });
                if (msgModel) {
                    bot.emit('msgDocFetched', msgModel);
                    // Prompt the user for configurations.
                    let filter = m => m.author.id === author.id && (m.content.toLowerCase() === 'add' || m.content.toLowerCase() === 'remove');
                    let tempMsg = channel.send('If you are going to add more reaction-roles to that message, put `add`. To remove the configuration say `remove`');
                    try {
                        let awaitMsgOps = { max: 1, time: 20000, errors: ['time'] };
                        let choice = (await channel.awaitMessages(filter, awaitMsgOps)).first();
                        if (choice.content === "add") {
                            if (!message.guild.me.hasPermission("MANAGE_ROLES")) return message.channel.send("First give me the permissions to manage roles, okay?")
                            let addMsgPrompt = await channel.send("Enter an emoji name followed by the corresponding role name, separated with a comma. e.g: WubbzyWalk, A Wubbzy Fan");
                            let collectorResult = await handleCollector(fetchedMessage, author, channel, msgModel);
                            msgModel.updateOne({ emojiRoleMappings: collectorResult }).then(() => {
                                bot.cachedMessageReactions.delete(fetchedMessage.id)
                                message.channel.send("Updated!");
                            })
                        }
                        else if (choice.content === "remove") {
                            msgModel.deleteOne().then(m => {
                                bot.cachedMessageReactions.set(fetchedMessage.id, false);
                                message.channel.send('Ok. Removed.');
                            }).catch(err => message.channel.send('Some error ocurred. Here\'s a debug: ' + err));
                        } else {
                            message.channel.send('Incorrect. Run this command again and say the correct parameters');
                        }
                    } catch (err) {
                        message.channel.send('You haven\'t said anything. Please try the command again.');
                    }
                }
                else {
                    message.channel.send("There is no configuration for that message. Please use `addrr` on a message to set up Role Reactions on that message.")
                }
            }
        }
        catch (err) {
            message.channel.send("Some error ocurred. Here's a debug: " + err);
        }
    },
    aliases: [],
    description: "Role reaction system (Edit)",
    guildonly: true,
    permissions: {
        user: [8, 0],
        bot: [268435456, 0]
    }
}
function handleCollector(fetchedMessage, author, channel, msgModel) {
    return new Promise((resolve, reject) => {
        let collectorFilter = (m) => m.author.id === author.id;
        let collector = new MessageCollector(channel, collectorFilter);
        let emojiRoleMappings = new Map(Object.entries(msgModel.emojiRoleMappings));
        collector.on('collect', msg => {
            if (msg.content.toLowerCase() === '?done') {
                collector.stop();
                resolve();
            }
            else {
                let { cache } = msg.guild.emojis;
                let [emojiName, roleName] = msg.content.split(/,\s+/);
                if (!emojiName && !roleName) return;
                let emoji = cache.find(emoji => emoji.name.toLowerCase() === emojiName.toLowerCase());
                if (!emoji) {
                    msg.channel.send("Emoji does not exist. Try again.")
                        .then(msg => msg.delete({ timeout: 2000 }))
                        .catch(err => console.log(err));
                    return;
                }
                let role = msg.guild.roles.cache.find(role => role.name.toLowerCase() === roleName.toLowerCase());
                if (!role) {
                    msg.channel.send("Role does not exist. Try again.")
                        .then(msg => msg.delete({ timeout: 2000 }))
                        .catch(err => console.log(err));
                    return;
                }
                fetchedMessage.react(emoji)
                    .catch(err => console.log(err));
                emojiRoleMappings.set(emoji.id, role.id);
            }
        });
        collector.on('end', () => {
            resolve(emojiRoleMappings);
        });
    });
}