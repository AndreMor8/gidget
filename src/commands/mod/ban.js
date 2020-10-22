//Must be tested =D

export default class extends Command {
    constructor(options) {
        super(options)
        this.guildonly = true;
        this.description = "Ban members from the server";
        this.permissions = {
            user: [4, 0],
            bot: [4, 0]
        }
    }
    async run(bot, message, args) {
        if (!args[1]) return message.channel.send("Usage: `ban (<user> [reason] || <users>)`")
        const users = [].concat(message.mentions.members.array());
        for (const thing of args.slice(1)) {
            if (thing.length > 19) continue;
            if (/^<@!?(\d+)>$/.test(thing)) continue;
            if (isNaN(thing)) continue;
            const user = message.guild.members.cache.get(thing) || await message.guild.members.fetch(thing).catch(() => { });
            if (user) {
                if (user.bannable) {
                    if (!users.some(e => e.id === user.id)) {
                        if((message.guild.owner.id === message.member.id) || (user.roles.highest.comparePositionTo(message.member.roles.highest) < 0)) {
                            users.push(user);
                        }
                    } else continue;
                } else continue;
            } else continue;
        }
        if (users.length < 1) return message.channel.send("Invalid user(s). Make sure you have entered the correct IDs or verify that we (me and you) can ban them.");
        const banned = [];
        for (const user of users) {
            try {
                await user.ban({ reason: (users.length === 1 ? args.slice(2).join(" ") : undefined) });
                banned.push(user);
            } catch (err) {
                await message.channel.send(`User ${user.user.tag} was not banned: ${err}`);
            }
        }
        await message.channel.send(banned.length < 1 ? "No one was banned" : `${banned.map(e => `\`${e.user.tag}\``).join(", ")} ${users.length === 1 ? "was banned" : "have been banned"}`)
    }
}