import BombSweeper from 'bombsweeper.js';
const replaces = {
    "N": "🟩",
    "*": "💣",
    "0": "⬜",
    "e0": "0️⃣",
    "1": "1️⃣",
    "2": "2️⃣",
    "3": "3️⃣",
    "4": "4️⃣",
    "5": "5️⃣",
    "6": "6️⃣",
    "7": "7️⃣",
    "8": "8️⃣"
};
export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Minesweeper game, and no, they are not spoilers.";
        this.aliases = ["bombsweeper", "ms"];
    }
    async run(bot, message) {
        if (message.author.mine) return message.channel.send("There is already a game with you in progress!");
        message.author.mine = new BombSweeper(9, 9);
        const to_edit = await message.channel.send("Please wait...");
        const col = message.channel.createMessageCollector((m) => m.author.id === message.author.id, { idle: 40000 });
        message.author.mine.onWin = () => col.stop("win");
        message.author.mine.onLoss = () => col.stop("loss");
        message.author.mine.PlaceBombs(10);
        col.on("collect", m => {
            if (m.content.toLowerCase() === "exit") col.stop("exit");
            const [pre_f, pre_c] = m.content.split(",");
            if(isNaN(pre_f)) return;
            if(isNaN(pre_c)) return;
            const [f, c] = [parseInt(pre_f), parseInt(pre_c)];
            if(f < 0 || f > 8) return;
            if(c < 0 || c > 8) return;
            console.log("here");
            message.author.mine.CheckCell(c, f);
            to_edit.edit(`__Minesweeper Game__\n\n${showToUser(message.author.mine.board, message.author.mine.mask)}`);
        });
        col.on("end", (c, r) => {
            if(r === "win") message.channel.send("You have won the minesweeper game :)");
            else if(r === "loss") message.channel.send("You lost the minesweeper game :(");
            else if(r === "exit") {
                to_edit.delete().catch(() => {});
                message.channel.send("Well, it seems you don't want to play minesweeper.");
            } else if (r === "idle") message.channel.send("Time's up (40s)");
            setTimeout(() => {
                message.author.mine = null;
            }, 900);
        })
        to_edit.edit(`__Minesweeper Game__\n**Use the fomat \`row,column\` to reveal a cell**\n\n${showToUser(message.author.mine.board, message.author.mine.mask)}`);
    }
}

function showToUser(board, mask) {
    let str = "";
    for (const i in board) {
        for (const o in board[i]) {
            if(o == 0) str += "`" + replaces[i == 0 ? "e0" : i] + "`";
            if (mask[i][o]) str += replaces[board[i][o]];
            else (str += replaces["N"]);
        }
        str += "\n";
    }
    str += `\`🟥${replaces["e0"]} ${replaces["1"]}${replaces["2"]} ${replaces["3"]}${replaces["4"]} ${replaces["5"]}${replaces["6"]} ${replaces["7"]}${replaces["8"]}\``
    return str;
}