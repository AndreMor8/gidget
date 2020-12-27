export default async function (bot, interaction) {
    if (interaction.type === 2) { 
        if (interaction.data.name === "wubbzy") {
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