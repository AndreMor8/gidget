import { MessageEmbed, User } from 'discord.js';
export default async function (bot, interaction) {
    if (interaction.type !== 2) return;
    switch (interaction.data.name) {
        case 'wubbzy': {
            await bot.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content: 'Wubbzy is the best! <a:WubbzyFaceA:612311062611492900>'
                    }
                }
            })
        }
            break;
        case 'say': {
            await bot.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        embeds: [{
                            title: "Say command",
                            description: interaction.data.options[0].value
                        }]
                    }
                }
            })
        }
            break;
        case 'confession': {
            const guild = bot.guilds.cache.get(interaction.guild_id);
            if (!guild) return await bot.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: { content: 'Please invite the real bot.' } } });
            const data = guild.cache.confessionconfig ? guild.confessionconfig : await guild.getConfessionConfig();
            if (!data.channelID) return await bot.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: { content: "The server hasn't set up a confession channel yet!\nDo it with `g%confessionconfig channel <channel>`", flags: 64 } } });
            const user_anon = interaction.data.options[1]?.value;
            if (!data.anon && user_anon) return await bot.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: { content: 'Sorry, the server does not accept anonymous confessions.', flags: 64 } } });

            const channel = guild.channels.cache.get(data.channelID);
            if (!channel) return await bot.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: { content: "It seems that the channel set by the admin does not exist!\nSet the channel again with `g%confessionconfig channel <channel>`", flags: 64 } } });

            const user = new User(bot, interaction.member.user);
            const embed = new MessageEmbed()
                .setTitle("New confession")
                .setAuthor(user_anon ? "Anonymous" : user.tag, user_anon ? undefined : user.displayAvatarURL({ dynamic: true }))
                .setDescription(interaction.data.options[0].value)
                .setTimestamp()
                .setColor("RANDOM");
            await channel.send(embed);

            await bot.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content: `The confession has been sent! Check it in ${channel.toString()}`,
                        flags: 64
                    },
                }
            })
        }
    }
}