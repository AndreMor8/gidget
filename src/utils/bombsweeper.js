import BombSweeper from 'bombsweeper.js';
const default_replaces = {
    "N": "🟩",
    "*": "💣",
    "0": "⬜",
    "1": "1️⃣",
    "2": "2️⃣",
    "3": "3️⃣",
    "4": "4️⃣",
    "5": "5️⃣",
    "6": "6️⃣",
    "7": "7️⃣",
    "8": "8️⃣",
    "F": "🚩",
    "C": "🟫",
    "S0": "<:zero_red:848003500264521748>",
    "S1": "<:one_red:848003876078092299>",
    "S2": "<:two_red:848004091199356969>",
    "S3": "<:three_red:848004556109774889>",
    "S4": "<:four_red:848004838226395196>",
    "S5": "<:five_red:848005141293563914>",
    "S6": "<:six_red:848005439693783051>",
    "S7": "<:seven_red:848005711853256734>",
    "S8": "<:eight_red:848005866157637673>"
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
        if (this.board[y][x] === "*") return false;
        let unmaskedCells = 0;
        this.mask.forEach(function (row) {
            unmaskedCells += row.reduce(function (sum, cell) {
                return sum + (cell ? 1 : 0);
            }, 0);
        });
        if (unmaskedCells === this.width * this.height - this.bombCount) return false;
        return true;
    }
    showToUser() {
        let str = `${this.replaces["C"]}`;
        for (let i = 0; i < this.width; i++) {
            str += `${this.replaces[`S${i}`]}`;
        }
        str += "\n";
        for (const i in this.board) {
            for (const o in this.board[i]) {
                if (o == 0) str += this.replaces[`S${i}`];
                if (this.mask[i][o]) str += this.replaces[this.board[i][o]];
                else {
                    if (this.flags.find(a => a[0] == o && a[1] == i)) str += this.replaces["F"];
                    else str += this.replaces["N"];
                }
            }
            str += "\n";
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