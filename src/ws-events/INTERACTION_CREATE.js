export default async function (bot, interaction) {
    console.log(interaction);
    if (interaction.type === 2) {
        if (interaction.id === "792783462078742538") {
            await bot.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content: 'Wubbzy is the best! <a:WubbzyFaceA:612311062611492900>'
                    }
                }
            })
        }
    }
}