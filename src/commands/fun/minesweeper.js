import BombSweeper from '../../utils/bombsweeper.js';

export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Minesweeper game, and no, they are not spoilers.";
        this.aliases = ["bombsweeper", "ms"];
    }
    async run(bot, message) {
        if (message.author.mine) return message.channel.send("There is already a game with you in progress!");
        message.author.mine = new BombSweeper();
        const to_edit = await message.channel.send("Please wait...");
        const col = message.channel.createMessageCollector({ filter: (m) => m.author.id === message.author.id, idle: 300000 });
        message.author.mine.onWin = () => col.stop("win");
        message.author.mine.onLoss = () => col.stop("loss");
        message.author.mine.PlaceBombs(10);
        col.on("collect", m => {
            try {
                if (m.content.toLowerCase() === "exit") col.stop("exit");
                const [pre_r, pre_c, flag] = m.content.split(",");
                const [r, c] = [parseInt(pre_r), parseInt(pre_c)];
                if (isNaN(r)) return;
                if (isNaN(c)) return;
                if (r < 0 || r > 8) return;
                if (c < 0 || c > 8) return;
                if (flag == "f") {
                    message.author.mine.setFlag(c, r);
                    to_edit.edit(`__Minesweeper Game__ (${message.author}) (in progress)\n\n${message.author.mine.showToUser()}`);
                    if (message.deletable) m.delete().catch(() => { });
                } else if (flag == "rf") {
                    message.author.mine.removeFlag(c, r);
                    to_edit.edit(`__Minesweeper Game__ (${message.author}) (in progress)\n\n${message.author.mine.showToUser()}`);
                    if (message.deletable) m.delete().catch(() => { });
                } else {
                    const can = message.author.mine.CheckCell(c, r);
                    if (can) to_edit.edit(`__Minesweeper Game__ (${message.author}) (in progress)\n\n${message.author.mine.showToUser()}`);
                    if (message.deletable) m.delete().catch(() => { });
                }
            } catch (err) {
                message.channel.send(err.toString());
            }
        });
        col.on("end", async (c, r) => {
            if (r === "win") {
                await to_edit.edit(`__Minesweeper Game__ (${message.author}) (Won)\n\n${message.author.mine.showToUser()}`);
                await message.channel.send("You have won the minesweeper game :)");
            } else if (r === "loss") {
                await to_edit.edit(`__Minesweeper Game__ (${message.author}) (Lost)\n\n${message.author.mine.showToUser()}`);
                await message.channel.send("You lost the minesweeper game :(");
            } else if (r === "exit") {
                await to_edit.delete().catch(() => { });
                await message.channel.send("Well, it seems you don't want to play minesweeper.");
            } else if (r === "idle") {
                to_edit.edit(`__Minesweeper Game__ (${message.author}) (5m timeout)\n\n${message.author.mine.showToUser()}`);
                await message.channel.send("Time's up (5m)");
            }
            message.author.mine = null;
        })
        to_edit.edit(`__Minesweeper Game__ (${message.author}) (in progress)\n**Use the format \`vertical,horizontal,<flag_mode>\` to reveal a cell**\n**The flag modes are \`f\` and \`rf\` to flag and unflag a cell respectively.**\n**Use \`exit\` for leave the game.**\n\n${message.author.mine.showToUser()}`);
    }
}

