/*
Copied from https://github.com/MARCROCK22/zenitsu/

The gameplay against the computer was added (in this case against the bot)

Canvas code and sprites: all the exact code was used.

Code logic: Some of the code was edited to suit the bot ecosystem.
Embeds are not used.
The library that renders the GIF has been changed.
Some inefficient code was changed when examining.
*/
import c4lib from 'connect4-ai';
const { Connect4, Connect4AI } = c4lib;
import { displayConnectFourBoard, displayBoard } from '../../utils/c4.js';
import c4top from '../../database/models/c4.js';

export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "The famous Connect4 game";
        this.permissions = {
            user: [0, 0],
            bot: [0, 32768]
        };
        this.aliases = ["fourinrow"];
        this.guildonly = true;
    }
    async run(bot, message, args) {
        if (!args[1]) return message.channel.send(`How to play Connect4 on Discord?\n\n1. Do \`g%c4 <someone>\`. It can be me or someone else.\n2. If you selected someone else, the person will be asked if they want to play. If you selected me then the game starts immediately.\n3. Within the game, they have to mark the column to add a token to it. The winner is the one with 4 tokens aligned together on the table.\n4. If someone no longer wants to play, they can say \`terminate\` to log out.\n5. If no one answers in less than 60 seconds the game is over.\n\nHappy playing! Credits to Lil MARCROCK22#2718 for the logic code and sprites :)`);
        if (message.guild.game) return message.channel.send("There is already a game going. Please wait for it to finish.");
        let user = (["hard", "medium", "easy"].includes(args[1].toLowerCase()) ? bot.user : (message.mentions.users.first() || message.guild.members.cache.get(args[1]) || await message.guild.members.fetch(args[1] || "123").catch(() => { }) || message.guild.members.cache.find(e => (e.user?.username === args.slice(1).join(" ")) || (e.user?.tag === args.slice(1).join(" ") || (e.displayName === args.slice(1).join(" "))))));
        if (user?.user) user = user.user;
        if (!user || user.id === message.author.id || (user.bot && user.id !== bot.user.id)) return message.channel.send("Invalid member!");
        if (user.c4turn) return message.channel.send("This user is playing the same game on another server! Try with someone else.");
        message.guild.game = user.id === bot.user.id ? (new Connect4AI()) : (new Connect4());
        if (user.id === bot.user.id) {
            const difficulty = ["hard", "medium", "easy"].includes(args[1].toLowerCase()) ? args[1].toLowerCase() : "medium";
            message.author.c4turn = 1;
            const res = await displayConnectFourBoard(displayBoard(message.guild.game.ascii()), message.guild.game);
            await message.channel.send({
                content: `${message.author.toString()}, it's your turn! [🔴]`,
                files: [{ attachment: res, name: "connect4.gif" }],
                allowedMentions: { parse: ["users"] }
            });
            const col2 = message.channel.createMessageCollector(msg => (([message.author.id].includes(msg.author.id) && msg.content === "terminate") || (msg.author.c4turn === msg.guild.game.gameStatus().currentPlayer && !isNaN(msg.content) && (Number(msg.content) >= 1 && Number(msg.content) <= 7) && message.guild.game.canPlay(parseInt(msg.content) - 1) && !message.guild.game.gameStatus().gameOver)), { idle: 120000 });
            col2.on('collect', async (msg) => {
                if (msg.content === "terminate") {
                    message.channel.send(`You ended this game! See you soon!`, { allowedMentions: { parse: ["users"] } });
                    return col2.stop("stoped");
                }
                msg.guild.game.play(parseInt(msg.content) - 1);
                if (msg.guild.game.gameStatus().gameOver && msg.guild.game.gameStatus().solution) {
                    console.log(message.guild.game.gameStatus());
                    const res = await displayConnectFourBoard(displayBoard(message.guild.game.ascii()), msg.guild.game);
                    message.channel.send({
                        content: `${message.author.toString()} won this game!`,
                        files: [{ attachment: res, name: "connect4.gif" }],
                        allowedMentions: { parse: ["users"] }
                    });
                    return col2.stop("winner");
                }
                else if (msg.guild.game.gameStatus().gameOver) {
                    return col2.stop("tier");
                }
                msg.guild.game.playAI(difficulty);
                if (msg.guild.game.gameStatus().gameOver && msg.guild.game.gameStatus().solution) {
                    console.log(message.guild.game.gameStatus());
                    const res = await displayConnectFourBoard(displayBoard(message.guild.game.ascii()), msg.guild.game);
                    message.channel.send({
                        content: `${bot.user.toString()} won this game!`,
                        files: [{ attachment: res, name: "connect4.gif" }],
                        allowedMentions: { parse: ["users"] }
                    });
                    return col2.stop("loser");
                }
                else if (msg.guild.game.gameStatus().gameOver) {
                    const res = await displayConnectFourBoard(displayBoard(message.guild.game.ascii()), message.guild.game);
                    message.channel.send({
                        content: `Great tier!`,
                        files: [{ attachment: res, name: "connect4.gif" }],
                        allowedMentions: { parse: ["users"] }
                    });
                    return col2.stop("tier");
                }
                const res = await displayConnectFourBoard(displayBoard(msg.guild.game.ascii()), msg.guild.game);
                message.channel.send({
                    content: `${message.author.toString()}, it's your turn! [🔴]`,
                    files: [{ attachment: res, name: "connect4.gif" }],
                    allowedMentions: { parse: ["users"] }
                });
            })
            col2.on('end', async (c, r) => {
                message.guild.game = null;
                message.author.c4turn = null;
                let doc = await c4top.findOne({ difficulty, userId: message.author.id });
                if(!doc) {
                    doc = await c4top.create({
                        userId: message.author.id,
                        difficulty,
                        cacheName: message.author.username
                    });
                }
                if (r === "winner") {
                    doc.updateOne({ $inc: { wins: 1 }, $set: { cacheName: message.author.username } }).catch(err => message.channel.send("Something happened when saving wins. " + err));
                } else if (r === "loser" || r === "stoped") {
                    doc.updateOne({ $inc: { loses: 1 }, $set: { cacheName: message.author.username } }).catch(err => message.channel.send("Something happened when saving loses. " + err));
                } else if (r === "tier") {
                    doc.updateOne({ $set: { cacheName: message.author.username } }).catch(err => message.channel.send("Something happened when saving your username. " + err));
                } else if (r === "idle") {
                    await doc.updateOne({ $inc: { loses: 1 }, $set: { cacheName: message.author.username } }).catch(err => message.channel.send("Something happened when saving loses. " + err));
                    message.channel.send("Waiting time is over (2m)! Bye.");
                }
            });
        } else {
            await message.channel.send(`Hey ${user.toString()}, do you want to play Connect4 with ${message.author.toString()}?\nY for Yes\nN for No.`, { allowedMentions: { parse: ["users"] } });
            const col = message.channel.createMessageCollector((m) => m.author.id === user.id, { time: 60000 });
            col.on("collect", async (m) => {
                if (m.content.toLowerCase() === "y") {
                    col.stop("ok");
                    user.c4turn = Math.floor(Math.random() * 2) + 1;
                    message.author.c4turn = user.c4turn == 2 ? 1 : 2;
                    const res = await displayConnectFourBoard(displayBoard(message.guild.game.ascii()), message.guild.game);
                    await message.channel.send({
                        content: `${message.author.c4turn == 1 ? message.author.toString() : user.toString()}, it's your turn! [🔴]`,
                        files: [{ attachment: res, name: "connect4.gif" }],
                        allowedMentions: { parse: ["users"] }
                    });
                    const col2 = message.channel.createMessageCollector(msg => (([user.id, message.author.id].includes(msg.author.id) && msg.content === "terminate") || (msg.author.c4turn === msg.guild.game.gameStatus().currentPlayer && !isNaN(msg.content) && (Number(msg.content) >= 1 && Number(msg.content) <= 7) && message.guild.game.canPlay(parseInt(msg.content) - 1) && !message.guild.game.gameStatus().gameOver)), { idle: 120000 });
                    col2.on('collect', async (msg) => {
                        if (msg.content === "terminate") {
                            message.channel.send(`${msg.author.toString()} ended this game! See you soon!`, { allowedMentions: { parse: ["users"] } });
                            return col2.stop("stoped");
                        }
                        msg.guild.game.play(parseInt(msg.content) - 1);
                        if (msg.guild.game.gameStatus().gameOver && msg.guild.game.gameStatus().solution) {
                            const res = await displayConnectFourBoard(displayBoard(message.guild.game.ascii()), msg.guild.game);
                            message.channel.send({
                                content: `${msg.author.toString()} won this game!`,
                                files: [{ attachment: res, name: "connect4.gif" }],
                                allowedMentions: { parse: ["users"] }
                            });
                            return col2.stop("winner");
                        }
                        else if (msg.guild.game.gameStatus().gameOver) {
                            const res = await displayConnectFourBoard(displayBoard(message.guild.game.ascii()), message.guild.game);
                            message.channel.send({
                                content: `Great tier!`,
                                files: [{ attachment: res, name: "connect4.gif" }],
                                allowedMentions: { parse: ["users"] }
                            });
                            return col2.stop("tier");
                        }
                        const res = await displayConnectFourBoard(displayBoard(msg.guild.game.ascii()), msg.guild.game);
                        message.channel.send({
                            content: `${message.author.c4turn == msg.author.c4turn ? user.toString() : message.author.toString()}, it's your turn! [${msg.author.c4turn == 2 ? "🔴" : "🟡"}]`,
                            files: [{ attachment: res, name: "connect4.gif" }],
                            allowedMentions: { parse: ["users"] }
                        });
                    })
                    col2.on('end', (c, r) => {
                        message.guild.game = null;
                        user.c4turn = null;
                        message.author.c4turn = null;
                        if (r === "idle") {
                            message.channel.send("Waiting time is over (2m)! Bye.");
                        }
                    })
                } else if (m.content.toLowerCase() === "n") {
                    col.stop("rejected");
                }
            });
            col.on("end", (c, r) => {
                if (r === "ok") return;
                else {
                    message.guild.game = undefined;
                    if (r === "rejected") message.channel.send("The user declined the invitation. Try it with someone else.");
                    else if (r === "time") message.channel.send("Time's up. Try it with someone else.");
                }
            })
        }
    }
}
