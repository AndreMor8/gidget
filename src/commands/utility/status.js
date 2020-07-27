const Discord = require('discord.js');

module.exports = {
    run: async (bot, message, args) => {
        const user = message.mentions.users.first() || message.client.users.cache.get(args[1]) || message.client.users.cache.find(m => m.username === args.slice(1).join(" ")) || message.author;

        const clientStatus = user.presence.clientStatus;
        const status = {
            online: "Online",
            idle: "Idle",
            dnd: "Do Not Disturb",
            offline: "Offline/Invisible"
        }

        const desktop = {
            online: "Desktop",
            idle: "Desktop",
            dnd: "Desktop",
        }

        const web = {
            online: "Web",
            idle: "Web",
            dnd: "Web",
        }

        const mobile = {
            online: "Mobile",
            idle: "Mobile",
            dnd: "Mobile",
        }

        const desktop2 = {
            online: "Desktop = Online",
            idle: "Desktop = Idle",
            dnd: "Desktop = Do Not Disturb",
        }

        const web2 = {
            online: "Web = Online",
            idle: "Web = Idle",
            dnd: "Web = Do Not Disturb",
        }

        const mobile2 = {
            online: "Mobile = Online",
            idle: "Mobile = Idle",
            dnd: "Mobile = Do Not Disturb",
        }

        var status2 = '';
        var i = 0;
        if (clientStatus !== null) {
            if (clientStatus["web"] !== undefined) {
                i = i + 1;
                status2 += web[clientStatus["web"]];
            } if (clientStatus["mobile"] !== undefined) {
                i = i + 1;
                if (i <= 1) {
                    status2 += mobile[clientStatus["mobile"]];
                }
            } if (clientStatus["desktop"] !== undefined) {
                i = i + 1;
                if (i <= 1) {
                    status2 += desktop[clientStatus["desktop"]];
                }
            }
        }

        if (i >= 2) {
            status2 = '';
            if (clientStatus["web"] !== undefined) {
                status2 += web2[clientStatus["web"]] + '\n';
            } if (clientStatus["mobile"] !== undefined) {
                status2 += mobile2[clientStatus["mobile"]] + '\n';
            } if (clientStatus["desktop"] !== undefined) {
                status2 += desktop2[clientStatus["desktop"]] + '\n';
            }
        }

        if (!args[1] || user.id == message.author.id) {
            if (user.presence.status !== 'offline') {
                if (i === 0) {
                    message.channel.send(`Your current status is: **${status[user.presence.status]}**, but I don't know in which client.`);
                } else if (i === 1) {
                    message.channel.send(`Your current status is: **${status[user.presence.status]}**, via the ` + status2 + ` client.`);
                } else {
                    message.channel.send(`You're connected in ` + i + ` clients:\n` + status2);
                }
            } else {
                message.channel.send(`Your current status is: **${status[user.presence.status]}**`);
            }
        } else {
            if (user.presence.status !== 'offline') {
                if (i === 0) {
                    message.channel.send(`${user.tag}'s current status is: **${status[user.presence.status]}**, but I don't know in which client.`);
                } else if (i === 1) {
                    message.channel.send(`${user.tag}'s current status is: **${status[user.presence.status]}**, via the ` + status2 + ` client.`);
                } else {
                    message.channel.send(`${user.tag} is connected in ` + i + ` clients: ` + status2);
                }
            } else {
                message.channel.send(`${user.tag}'s current status is: **${status[user.presence.status]}**`);
            }
        }

    },
    aliases: [],
    description: "Client status",
}