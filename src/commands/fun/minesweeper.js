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
        const col = message.channel.createMessageCollector((m) => m.author.id === message.author.id, { idle: 300000 });
        message.author.mine.onWin = () => col.stop("win");
        message.author.mine.onLoss = () => col.stop("loss");
        message.author.mine.PlaceBombs(10);
        col.on("collect", m => {
            try {
                if (m.content.toLowerCase() === "exit") col.stop("exit");
                const [pre_r, pre_c, flag] = m.content.split(",");
                if (isNaN(pre_r)) return;
                if (isNaN(pre_c)) return;
                const [r, c] = [parseInt(pre_r), parseInt(pre_c)];
                if (r < 0 || r > 8) return;
                if (c < 0 || c > 8) return;
                if (flag == "f") message.author.mine.setFlag(c, r);
                else if (flag == "rf") message.author.mine.removeFlag(c, r);
                else message.author.mine.CheckCell(c, r);
                to_edit.edit(`__Minesweeper Game__\n\n${message.author.mine.showToUser()}`);
                if (message.deletable) m.delete().catch(() => { });
            } catch (err) {
                message.channel.send(err.toString());
            }
        });
        col.on("end", (c, r) => {
            if (r === "win") message.channel.send("You have won the minesweeper game :)");
            else if (r === "loss") message.channel.send("You lost the minesweeper game :(");
            else if (r === "exit") {
                to_edit.delete().catch(() => { });
                message.channel.send("Well, it seems you don't want to play minesweeper.");
            } else if (r === "idle") message.channel.send("Time's up (5m)");
            setTimeout(() => {
                message.author.mine = null;
            }, 900);
        })
        to_edit.edit(`__Minesweeper Game__\n**Use the fomat \`row,column,<flag_mode>\` to reveal a cell**\n**The flag modes are \`f\` and \`rf\` to flag and unflag a cell respectively.**\n**Use \`exit\` for leave the game.**\n\n${message.author.mine.showToUser()}`);
    }
}

