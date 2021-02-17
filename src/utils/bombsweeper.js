import BombSweeper from 'bombsweeper.js';
const default_replaces = {
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
    "8": "8️⃣",
    "F": "🚩"
};
export default class extends BombSweeper {
    constructor(width = 9, height = 9, onWin = () => { }, onLoss = () => { }, replaces = default_replaces) {
        super(width, height, onWin, onLoss);
        this.replaces = replaces;
        this.flags = [];
    }
    setFlag(x, y) {
        this.checkValue(x, y);
        if (this.flags.find(a => a[0] == x && a[1] == y)) throw new Error("The chosen position is already flagged.");
        if (this.mask[y][x]) throw new Error("You cannot flag an already revealed box.")
        this.flags.push([x, y]);
        return this;
    }
    removeFlag(x, y) {
        this.checkValue(x, y);
        const found = this.flags.find(a => a[0] == x && a[1] == y);
        if (found) {
            const new_arr = this.flags.filter(a => !(a[0] == x && a[1] == y));
            this.flags = new_arr;
            return this;
        } else throw new Error("The chosen position isn't flagged.");
    }
    CheckCell(x, y) {
        this.checkValue(x, y);
        if (this.flags.find(a => a[0] == x && a[1] == y)) throw new Error("The chosen position is flagged. You cannot reveal it.");
        super.CheckCell(x, y);
        return this;
    }
    showToUser() {
        let str = "";
        for (const i in this.board) {
            for (const o in this.board[i]) {
                if (o == 0) str += "`" + this.replaces[i == 0 ? "e0" : i] + "`";
                if (this.mask[i][o]) str += this.replaces[this.board[i][o]];
                else {
                    if (this.flags.find(a => a[0] == o && a[1] == i)) str += this.replaces["F"];
                    else str += this.replaces["N"];
                }
            }
            str += "\n";
        }
        str += `\`🟥`;
        for (let i = 0; i < this.width; i++) {
            str += `${this.replaces[i == 0 ? "e0" : i]}${(i % 2) ? "" : " "}${(this.width - 1) == i ? "`" : ""}`;
        }
        return str;
    }
    checkValue(x, y) {
        if (typeof x !== 'number') throw new Error("'x' must be an integer");
        if (typeof y !== 'number') throw new Error("'y' must be an integer");
        if (x > (this.width - 1)) throw new Error("'x' must be less than the width");
        if (y > (this.height - 1)) throw new Error("'y' must be less than the height");
        if (x < 0) throw new Error("'x' must not be less than 0");
        if (y < 0) throw new Error("'x' must not be less than 0");
        return true;
    }
}