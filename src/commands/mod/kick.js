export default class extends Command {
    constructor(options) {
        super(options)
        this.guildonly = true;
        this.description = "Kick members from the server";
        this.permissions = {
            user: [2n, 0n],
            bot: [2n, 0n]
        }
    }
    async run(bot, message, args) {
        if (!args[1]) return message.channel.send("Usage: `kick (<user> [reason] || <users>)`")
        const users = message.mentions.members.clone().filter(e => (e.kickable) && (e.id !== message.guild.ownerID) && (e.roles.highest.comparePositionTo(message.member.roles.highest) < 0)).array();
        for (const thing of args.slice(1)) {
            if (thing.length > 19) continue;
            if (/^<@!?(\d+)>$/.test(thing)) continue;
            if (isNaN(thing)) continue;
            const user = message.guild.members.cache.get(thing) || await message.guild.members.fetch(thing).catch(() => { });
            if (user) {
                if (user.kickable) {
                    if (!users.some(e => e.id === user.id)) {
                        if ((message.guild.ownerID !== user.id) && (user.roles.highest.comparePositionTo(message.member.roles.highest) < 0)) {
                            users.push(user);
                        }
                    } else continue;
                } else continue;
            } else continue;
        }
        if (users.length < 1) return message.channel.send("Invalid user(s). Make sure you have entered the correct IDs or verify that we (me and you) can kick them.");
        const kicked = [];
        for (const user of users) {
            try {
                await user.kick((users.length === 1) ? args.slice(2).join(" ") : undefined);
                kicked.push(user);
            } catch (err) {
                await message.channel.send(`User ${user.user.tag} was not kicked: ${err}`);
            }
        }
        await message.channel.send(kicked.length < 1 ? "No one was kicked" : `${kicked.map(e => `\`${e.user.tag}\``).join(", ")} ${users.length === 1 ? "was kicked" : "have been kicked"}`)
    }
}