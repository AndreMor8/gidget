import { MessageButton } from 'discord.js';
import Board from 'tictactoe-board';
import ai from 'tictactoe-complex-ai';

export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Now it comes with 4 difficulty levels!";
        this.permissions = {
            user: [0n, 0n],
            bot: [0n, 0n]
        }
        this.aliases = ["ttt"];
    }
    async run(bot, message, args) {
        //TRYING TO GET USER
        if (!args[1]) {
            const easy_but = new MessageButton()
                .setStyle("SUCCESS")
                .setCustomID("ttt_c_easymode")
                .setLabel("Easy");
            const medium_but = new MessageButton()
                .setStyle("PRIMARY")
                .setCustomID("ttt_c_mediummode")
                .setLabel("Medium");
            const hard_but = new MessageButton()
                .setStyle("SECONDARY")
                .setCustomID("ttt_c_hardmode")
                .setLabel("Hard");
            const expert_but = new MessageButton()
                .setStyle("DANGER")
                .setCustomID("ttt_c_expertmode")
                .setLabel("Expert");
            const msg = await message.channel.send({ content: `How to play TicTacToe on Discord?\n\n1. Do \`g%ttt <someone>\`. It can be me or someone else.\n2. If you selected someone else, the person will be asked if they want to play. If you selected me then the game starts immediately. You can also make it difficult to play with me (easy, medium, hard, expert).\n3. Now you should start playing calmly as you should. The winner is the one who makes a row, column, or diagonal with their token\n4. If someone no longer wants to play, they can press the \`terminate\` button to log out.\n5. If no one answers in less than 60 seconds the game is over.\n\nHappy playing!`, components: [[easy_but, medium_but, hard_but, expert_but]] });
            const filter = (button) => {
                if (button.user.id !== message.author.id) button.reply({ content: "Use your own instance by using `g%ttt`", ephemeral: true });
                return button.user.id === message.author.id;
            };
            const col = msg.createMessageComponentInteractionCollector({ filter, time: 20000 });
            col.on("collect", (button) => {
                if (button.customID === "ttt_c_easymode") {
                    this.run(bot, message, ["tictactoe", "easy"]);
                } else if (button.customID === "ttt_c_mediummode") {
                    this.run(bot, message, ["tictactoe", "medium"]);
                } else if (button.customID === "ttt_c_hardmode") {
                    this.run(bot, message, ["tictactoe", "hard"]);
                } else if (button.customID === "ttt_c_expertmode") {
                    this.run(bot, message, ["tictactoe", "expert"]);
                }
                button.update({ content: msg.content, components: [[easy_but.setDisabled(true), medium_but.setDisabled(true), hard_but.setDisabled(true), expert_but.setDisabled(true)]] });
                col.stop("ok");
            });
            return;
        }
        if (message.channel.tttgame) return message.channel.send("There is already a game going on this channel. Please wait for it to finish or go to another channel.");
        let user = (["hard", "medium", "easy", "expert"].includes(args[1].toLowerCase()) ? bot.user : (message.guild ? message.mentions.users.first() || message.guild.members.cache.get(args[1]) || await message.guild.members.fetch(args[1] || "123").catch(() => { }) || message.guild.members.cache.find(e => (e.user?.username === args.slice(1).join(" ")) || (e.user?.tag === args.slice(1).join(" ") || (e.displayName === args.slice(1).join(" ")))) : bot.user));
        if (user?.user) user = user.user;
        if (!user || user.id === message.author.id || (user.bot && user.id !== bot.user.id)) return message.channel.send("Invalid member!");
        await user.fetch();
        if (!message.guild) await message.author.createDM();

        //STARTING GAME
        message.channel.tttgame = new Board.default();
        const terminateButton = new MessageButton()
            .setCustomID("ttt_g_terminate")
            .setLabel("Terminate")
            .setStyle("DANGER");
        if (user.id === bot.user.id) {
            const difficulty = ["expert", "hard", "medium", "easy"].includes(args[1].toLowerCase()) ? args[1].toLowerCase() : "medium";
            const res = message.channel.tttgame.grid.map(buttonMap);
            //Only applicable here. X is supposed to be the local and O is the guest, but you can't do that with the bot.
            const randomturn = Boolean(Math.round(Math.random()));
            const aiInstance = ai.createAI({ level: difficulty, ai: randomturn ? 'X' : 'O', player: randomturn ? 'O' : 'X' });
            const finalMsg = await message.channel.send({
                content: `${randomturn ? bot.user.toString() : message.author.toString()}'s turn`,
                allowedMentions: { parse: ["users"] },
                components: [[res[0], res[1], res[2]], [res[3], res[4], res[5]], [res[6], res[7], res[8]], [terminateButton]]
            });
            const col2 = finalMsg.createMessageComponentInteractionCollector({
                filter: async button => {
                    if (![message.author.id].includes(button.user.id)) await button.reply({ content: "Use your own instance by using `g%ttt`", ephemeral: true });
                    const seeTurn = Boolean(button.channel.tttgame.availablePositionCount() % 2);
                    const turn = randomturn ? (seeTurn ? bot.user.id : message.author.id) : (seeTurn ? message.author.id : bot.user.id);
                    if (turn !== button.user.id && !button.replied) await button.reply({ content: "It's not your turn yet!", ephemeral: true });
                    return ([message.author.id].includes(button.user.id) && turn === button.user.id);
                }, idle: 120000
            });
            col2.on('collect', async (button) => {
                if (button.customID === "ttt_g_terminate") {
                    return col2.stop("stoped");
                }
                const userRes = parseInt(button.customID.split("_")[2]);
                if (button.channel.tttgame.isPositionTaken(userRes + 1)) return button.deferUpdate();
                button.channel.tttgame = button.channel.tttgame.makeMove(userRes + 1, randomturn ? "O" : "X");
                if (button.channel.tttgame.isGameOver()) {
                    if (button.channel.tttgame.hasWinner()) {
                        const res = button.channel.tttgame.grid.map(buttonMap);
                        button.update({
                            content: `${message.author.toString()} won this game!`,
                            allowedMentions: { parse: ["users"] },
                            components: [[res[0].setDisabled(true), res[1].setDisabled(true), res[2].setDisabled(true)], [res[3].setDisabled(true), res[4].setDisabled(true), res[5].setDisabled(true)], [res[6].setDisabled(true), res[7].setDisabled(true), res[8].setDisabled(true)], [terminateButton.setDisabled(true)]]
                        });
                        return col2.stop("winner");
                    } else if (button.channel.tttgame.isGameDraw()) {
                        const res = button.channel.tttgame.grid.map(buttonMap);
                        button.update({
                            content: `Great draw!`,
                            allowedMentions: { parse: ["users"] },
                            components: [[res[0].setDisabled(true), res[1].setDisabled(true), res[2].setDisabled(true)], [res[3].setDisabled(true), res[4].setDisabled(true), res[5].setDisabled(true)], [res[6].setDisabled(true), res[7].setDisabled(true), res[8].setDisabled(true)], [terminateButton.setDisabled(true)]]
                        });
                        return col2.stop("draw");
                    }
                }
                const res1 = button.channel.tttgame.grid.map(buttonMap);
                await button.update({
                    content: `${bot.user.toString()}'s turn`,
                    allowedMentions: { parse: ["users"] },
                    components: [[res1[0], res1[1], res1[2]], [res1[3], res1[4], res1[5]], [res1[6], res1[7], res1[8]], [terminateButton]]
                });

                const aiRes = await aiInstance.play(button.channel.tttgame.grid);
                button.channel.tttgame = button.channel.tttgame.makeMove(aiRes + 1, randomturn ? "X" : "O");
                if (button.channel.tttgame.isGameOver()) {
                    if (button.channel.tttgame.hasWinner()) {
                        const res = button.channel.tttgame.grid.map(buttonMap);
                        finalMsg.edit({
                            content: `${bot.user.toString()} won this game!`,
                            allowedMentions: { parse: ["users"] },
                            components: [[res[0].setDisabled(true), res[1].setDisabled(true), res[2].setDisabled(true)], [res[3].setDisabled(true), res[4].setDisabled(true), res[5].setDisabled(true)], [res[6].setDisabled(true), res[7].setDisabled(true), res[8].setDisabled(true)], [terminateButton.setDisabled(true)]]
                        });
                        return col2.stop("winner");
                    } else if (button.channel.tttgame.isGameDraw()) {
                        const res = button.channel.tttgame.grid.map(buttonMap);
                        finalMsg.edit({
                            content: `Great draw!`,
                            allowedMentions: { parse: ["users"] },
                            components: [[res[0].setDisabled(true), res[1].setDisabled(true), res[2].setDisabled(true)], [res[3].setDisabled(true), res[4].setDisabled(true), res[5].setDisabled(true)], [res[6].setDisabled(true), res[7].setDisabled(true), res[8].setDisabled(true)], [terminateButton.setDisabled(true)]]
                        });
                        return col2.stop("draw");
                    }
                }
                const res = button.channel.tttgame.grid.map(buttonMap);
                await finalMsg.edit({
                    content: `${message.author.toString()}'s turn`,
                    allowedMentions: { parse: ["users"] },
                    components: [[res[0], res[1], res[2]], [res[3], res[4], res[5]], [res[6], res[7], res[8]], [terminateButton]]
                });
            });

            col2.on('end', async (c, r) => {
                const res = message.channel.tttgame.grid.map(buttonMap);
                if (r === "stoped") await c.last().update({
                    content: r === "idle" ? "Timeout (2m)" : `Game terminated by ${message.author.toString()}`,
                    components: [[res[0].setDisabled(true), res[1].setDisabled(true), res[2].setDisabled(true)], [res[3].setDisabled(true), res[4].setDisabled(true), res[5].setDisabled(true)], [res[6].setDisabled(true), res[7].setDisabled(true), res[8].setDisabled(true)], [terminateButton.setDisabled(true)]]
                });
                if (r === "stoped") c.last().followUp("You ended this game. See you soon!")
                if (r === "idle") finalMsg.reply("Waiting time is over (2m)! Bye.");
                message.channel.tttgame = undefined;
            });
            if (randomturn) {
                const aiRes = await aiInstance.play(message.channel.tttgame.grid);
                if (!col2.ended || message.channel.tttgame) {
                    message.channel.tttgame = message.channel.tttgame.makeMove(aiRes + 1, "X");
                    const res = message.channel.tttgame.grid.map(buttonMap);
                    await finalMsg.edit({
                        content: `${message.author.toString()}'s turn`,
                        allowedMentions: { parse: ["users"] },
                        components: [[res[0], res[1], res[2]], [res[3], res[4], res[5]], [res[6], res[7], res[8]], [terminateButton]]
                    });
                }

            }
        } else {
            const but_yes = new MessageButton()
                .setCustomID("ttt_c_vsyes")
                .setStyle("SUCCESS")
                .setLabel("Yes");
            const but_no = new MessageButton()
                .setCustomID("ttt_c_vsno")
                .setStyle("DANGER")
                .setLabel("No");

            const msg_response = await message.channel.send({ content: `Hey ${user.toString()}, do you want to play TicTacToe with ${message.author.toString()}?`, allowedMentions: { parse: ["users"] }, components: [[but_yes, but_no]] });

            const col = msg_response.createMessageComponentInteractionCollector({
                filter: (b) => {
                    if (b.user.id !== user.id) b.reply({ content: "You are not the expecting user!", ephemeral: true });
                    return b.user.id === user.id;
                }, time: 60000
            });

            col.on("collect", async (button) => {
                if (button.customID === "ttt_c_vsyes") {
                    col.stop("ok");
                    const res = button.channel.tttgame.grid.map(buttonMap);
                    const finalMsg = await message.channel.send({
                        content: `${message.author.toString()}'s turn`,
                        allowedMentions: { parse: ["users"] },
                        components: [[res[0], res[1], res[2]], [res[3], res[4], res[5]], [res[6], res[7], res[8]], [terminateButton]]
                    });
                    const col2 = finalMsg.createMessageComponentInteractionCollector({
                        filter: async button => {
                            if (![message.author.id, user.id].includes(button.user.id)) await button.reply({ content: "Use your own instance by using `g%ttt`", ephemeral: true });
                            const turn = button.channel.tttgame.currentMark() === "X" ? message.author.id : user.id;
                            if (turn !== button.user.id && button.customID !== "ttt_g_terminate" && !button.replied) await button.reply({ content: "It's not your turn yet!", ephemeral: true });
                            return ([message.author.id, user.id].includes(button.user.id) && (button.customID === "ttt_g_terminate" || turn === button.user.id));
                        }, idle: 120000
                    });
                    col2.on('collect', async (button) => {
                        if (button.customID === "ttt_g_terminate") {
                            return col2.stop("stoped");
                        }
                        const userRes = parseInt(button.customID.split("_")[2]);
                        if (button.channel.tttgame.isPositionTaken(userRes + 1)) return button.deferUpdate();
                        button.channel.tttgame = button.channel.tttgame.makeMove(userRes + 1, button.channel.tttgame.currentMark());
                        if (button.channel.tttgame.isGameOver()) {
                            if (button.channel.tttgame.hasWinner()) {
                                const res = button.channel.tttgame.grid.map(buttonMap);
                                button.update({
                                    content: `${button.user.toString()} won this game!`,
                                    allowedMentions: { parse: ["users"] },
                                    components: [[res[0].setDisabled(true), res[1].setDisabled(true), res[2].setDisabled(true)], [res[3].setDisabled(true), res[4].setDisabled(true), res[5].setDisabled(true)], [res[6].setDisabled(true), res[7].setDisabled(true), res[8].setDisabled(true)], [terminateButton.setDisabled(true)]]
                                });
                                return col2.stop("winner");
                            } else if (button.channel.tttgame.isGameDraw()) {
                                const res = button.channel.tttgame.grid.map(buttonMap);
                                button.update({
                                    content: `Great draw!`,
                                    allowedMentions: { parse: ["users"] },
                                    components: [[res[0].setDisabled(true), res[1].setDisabled(true), res[2].setDisabled(true)], [res[3].setDisabled(true), res[4].setDisabled(true), res[5].setDisabled(true)], [res[6].setDisabled(true), res[7].setDisabled(true), res[8].setDisabled(true)], [terminateButton.setDisabled(true)]]
                                });
                                return col2.stop("draw");
                            }
                        }
                        const res = button.channel.tttgame.grid.map(buttonMap);
                        await button.update({
                            content: `${button.channel.tttgame.currentMark() === "X" ? message.author.toString() : user.toString()}'s turn`,
                            allowedMentions: { parse: ["users"] },
                            components: [[res[0], res[1], res[2]], [res[3], res[4], res[5]], [res[6], res[7], res[8]], [terminateButton]]
                        });
                    })
                    col2.on('end', async (c, r) => {
                        const res = message.channel.tttgame.grid.map(buttonMap);
                        if (r === "stoped") await c.last().update({
                            content: r === "idle" ? "Timeout (2m)" : `Game terminated by ${c.last().user.toString()}`,
                            components: [[res[0].setDisabled(true), res[1].setDisabled(true), res[2].setDisabled(true)], [res[3].setDisabled(true), res[4].setDisabled(true), res[5].setDisabled(true)], [res[6].setDisabled(true), res[7].setDisabled(true), res[8].setDisabled(true)], [terminateButton.setDisabled(true)]]
                        });
                        if (r === "stoped") c.last().followUp("You ended this game! See you soon!");
                        if (r === "idle") message.channel.send("Waiting time is over (2m)! Bye.");
                        message.channel.tttgame = undefined;
                    })
                } else if (button.customID === "ttt_c_vsno") {
                    col.stop("rejected");
                }
            });
            col.on("end", async (c, r) => {
                if (r === "ok") return c.last().update({ content: "Accepted", components: [[but_yes.setDisabled(true), but_no.setDisabled(true)]] });
                else {
                    if (r === "rejected") await c.last().update({ content: "The user declined the invitation. Try it with someone else.", components: [[but_yes.setDisabled(true), but_no.setDisabled(true)]] });
                    else if (r === "time") await msg_response.edit({ content: "Time's up. Try it with someone else.", components: [[but_yes.setDisabled(true), but_no.setDisabled(true)]] });
                    message.channel.tttgame = undefined;
                }
            })
        }

    }
}

function buttonMap(e, i) {
    return new MessageButton()
        .setStyle(e === '' ? "SECONDARY" : undefined || e === "X" ? "DANGER" : undefined || e === "O" ? "PRIMARY" : undefined)
        .setCustomID(`ttt_g_${i}`)
        .setLabel(e || "?")
        .setDisabled(e !== '');
}