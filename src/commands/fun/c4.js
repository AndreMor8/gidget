/*
Copied from https://github.com/MARCROCK22/zenitsu/

The gameplay against the computer was added (in this case against the bot)

Canvas code and sprites: all the exact code was used.

Code logic: Some of the code was edited to suit the bot ecosystem.
Embeds are not used.
The library that renders the GIF has been changed.
Some inefficient code was changed when examining.
*/
import c4lib from 'connect4-ai';
import { displayConnectFourBoard, displayBoard } from '../../utils/c4.js';
import c4top from '../../database/models/c4.js';
import { MessageActionRow, MessageButton } from 'discord.js';
const { Connect4, Connect4AI } = c4lib;
const turns = new Map();

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "The famous Connect4 game";
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 32768n]
    };
    this.aliases = ["fourinrow"];
  }
  async run(bot, message, args) {
    const easy_but = new MessageButton()
      .setStyle("SUCCESS")
      .setCustomId("c4_c_easymode")
      .setLabel("Easy");
    const medium_but = new MessageButton()
      .setStyle("PRIMARY")
      .setCustomId("c4_c_mediummode")
      .setLabel("Medium");
    const hard_but = new MessageButton()
      .setStyle("DANGER")
      .setCustomId("c4_c_hardmode")
      .setLabel("Hard");
    if (!args[1]) {
      const msg = await message.channel.send({ content: `How to play Connect4 on Discord?\n\n1. Do \`g%c4 <someone>\`. It can be me or someone else.\n2. If you selected someone else, the person will be asked if they want to play. If you selected me then the game starts immediately. You can also make it difficult to play with me (easy, medium, hard).\n3. Within the game, they have to mark the column to add a token to it. The winner is the one with 4 tokens aligned together on the table.\n4. If someone no longer wants to play, they can say \`terminate\` to log out.\n5. If no one answers in less than 60 seconds the game is over.\n\nHappy playing! Credits to Lil MARCROCK22#2718 for the logic code and sprites :)`, components: [new MessageActionRow().addComponents([easy_but, medium_but, hard_but])] });
      const filter = (button) => {
        if (button.user.id !== message.author.id) button.reply({ content: "Use your own instance by using `g%c4`", ephemeral: true });
        return button.user.id === message.author.id;
      };
      const col = msg.createMessageComponentCollector({ filter, time: 20000 });
      col.on("collect", (button) => {
        if (button.customId === "c4_c_easymode") this.run(bot, message, ["c4", "easy"])
        else if (button.customId === "c4_c_mediummode") this.run(bot, message, ["c4", "medium"])
        else if (button.customId === "c4_c_hardmode") this.run(bot, message, ["c4", "hard"])

        button.update({ content: msg.content, components: [new MessageActionRow().addComponents([easy_but.setDisabled(true), medium_but.setDisabled(true), hard_but.setDisabled(true)])] });
        col.stop("ok");
      });
      return;
    }
    if (message.channel.game) return message.channel.send("There is already a game going on this channel. Please wait for it to finish or go to another channel.");
    let user = (["hard", "medium", "easy"].includes(args[1].toLowerCase()) ? bot.user : (message.guild ? message.mentions.users.first() || message.guild.members.cache.get(args[1]) || await message.guild.members.fetch(args[1] || "123").catch(() => { }) || message.guild.members.cache.find(e => (e.user?.username === args.slice(1).join(" ")) || (e.user?.tag === args.slice(1).join(" ") || (e.displayName === args.slice(1).join(" ")))) : bot.user));
    if (user?.user) user = user.user;
    if (!user || user.id === message.author.id || (user.bot && user.id !== bot.user.id)) return message.channel.send("Invalid member!");
    if (turns.get(user.id)) return message.channel.send("This user is playing the same game on another server! Try with someone else.");
    message.channel.game = user.id === bot.user.id ? (new Connect4AI()) : (new Connect4());
    if (user.id === bot.user.id) {
      const difficulty = ["hard", "medium", "easy"].includes(args[1].toLowerCase()) ? args[1].toLowerCase() : "medium";
      turns.set(message.author.id, 1);
      const res = await displayConnectFourBoard(displayBoard(message.channel.game.ascii()), message.channel.game);
      await message.channel.send({
        content: `${message.author.toString()}, it's your turn! [🔴]`,
        files: [{ attachment: res, name: "connect4.gif" }],
        allowedMentions: { parse: ["users"] }
      });
      const col2 = message.channel.createMessageCollector({ filter: msg => (([message.author.id].includes(msg.author.id) && msg.content === "terminate") || (turns.get(msg.author.id) === msg.channel.game.gameStatus().currentPlayer && !isNaN(msg.content) && (Number(msg.content) >= 1 && Number(msg.content) <= 7) && message.channel.game.canPlay(parseInt(msg.content) - 1) && !message.channel.game.gameStatus().gameOver)), idle: 120000 });
      col2.on('collect', async (msg) => {
        if (msg.content === "terminate") {
          message.channel.send(`You ended this game! See you soon!`);
          return col2.stop("stoped");
        }
        msg.channel.game.play(parseInt(msg.content) - 1);
        if (msg.channel.game.gameStatus().gameOver && msg.channel.game.gameStatus().solution) {
          console.log(message.channel.game.gameStatus());
          const res = await displayConnectFourBoard(displayBoard(message.channel.game.ascii()), msg.channel.game);
          message.channel.send({
            content: `${message.author.toString()} won this game!`,
            files: [{ attachment: res, name: "connect4.gif" }],
            allowedMentions: { parse: ["users"] }
          });
          return col2.stop("winner");
        }
        else if (msg.channel.game.gameStatus().gameOver) {
          return col2.stop("tier");
        }
        msg.channel.game.playAI(difficulty);
        if (msg.channel.game.gameStatus().gameOver && msg.channel.game.gameStatus().solution) {
          console.log(message.channel.game.gameStatus());
          const res = await displayConnectFourBoard(displayBoard(message.channel.game.ascii()), msg.channel.game);
          message.channel.send({
            content: `${bot.user.toString()} won this game!`,
            files: [{ attachment: res, name: "connect4.gif" }],
            allowedMentions: { parse: ["users"] }
          });
          return col2.stop("loser");
        }
        else if (msg.channel.game.gameStatus().gameOver) {
          const res = await displayConnectFourBoard(displayBoard(message.channel.game.ascii()), message.channel.game);
          message.channel.send({
            content: `Great tier!`,
            files: [{ attachment: res, name: "connect4.gif" }],
            allowedMentions: { parse: ["users"] }
          });
          return col2.stop("tier");
        }
        const res = await displayConnectFourBoard(displayBoard(msg.channel.game.ascii()), msg.channel.game);
        message.channel.send({
          content: `${message.author.toString()}, it's your turn! [🔴]`,
          files: [{ attachment: res, name: "connect4.gif" }],
          allowedMentions: { parse: ["users"] }
        });
      })
      col2.on('end', async (c, r) => {
        message.channel.game = null;
        turns.delete(message.author.id);
        let doc = await c4top.findOne({ difficulty, userId: message.author.id });
        if (!doc) {
          doc = await c4top.create({
            userId: message.author.id,
            difficulty,
            cacheName: message.author.username
          });
        }
        if (r === "winner") {
          doc.updateOne({ $inc: { wins: 1 }, $set: { cacheName: message.author.username } }).catch(err => message.channel.send("Something happened when saving wins. " + err));
        } else if (r === "loser" || r === "stoped") {
          doc.updateOne({ $inc: { loses: 1 }, $set: { cacheName: message.author.username } }).catch(err => message.channel.send("Something happened when saving loses. " + err));
        } else if (r === "tier") {
          doc.updateOne({ $set: { cacheName: message.author.username } }).catch(err => message.channel.send("Something happened when saving your username. " + err));
        } else if (r === "idle") {
          await doc.updateOne({ $inc: { loses: 1 }, $set: { cacheName: message.author.username } }).catch(err => message.channel.send("Something happened when saving loses. " + err));
          message.channel.send("Waiting time is over (2m)! Bye.");
        }
      });
    } else {
      const but_yes = new MessageButton()
        .setCustomId("c4_c_vsyes")
        .setStyle("SUCCESS")
        .setLabel("Yes");
      const but_no = new MessageButton()
        .setCustomId("c4_c_vsno")
        .setStyle("DANGER")
        .setLabel("No");

      const msg_response = await message.channel.send({ content: `Hey ${user.toString()}, do you want to play Connect4 with ${message.author.toString()}?`, allowedMentions: { parse: ["users"] }, components: [new MessageActionRow().addComponents([but_yes, but_no])] });

      const col = msg_response.createMessageComponentCollector({
        filter: (b) => {
          if (b.user.id !== user.id) b.reply({ content: "You are not the expecting user!", ephemeral: true });
          return b.user.id === user.id;
        }, time: 60000
      });

      col.on("collect", async (button) => {
        if (button.customId === "c4_c_vsyes") {
          col.stop("ok");
          const generatedTurn = Math.floor(Math.random() * 2) + 1;
          turns.set(user.id, generatedTurn);
          turns.set(message.author.id, generatedTurn == 2 ? 1 : 2);
          const res = await displayConnectFourBoard(displayBoard(message.channel.game.ascii()), message.channel.game);
          await message.channel.send({
            content: `${turns.get(message.author.id) == 1 ? message.author.toString() : user.toString()}, it's your turn! [🔴]`,
            files: [{ attachment: res, name: "connect4.gif" }],
            allowedMentions: { parse: ["users"] }
          });
          const col2 = message.channel.createMessageCollector({ filter: msg => (([user.id, message.author.id].includes(msg.author.id) && msg.content === "terminate") || (turns.get(msg.author.id) === msg.channel.game.gameStatus().currentPlayer && !isNaN(msg.content) && (Number(msg.content) >= 1 && Number(msg.content) <= 7) && message.channel.game.canPlay(parseInt(msg.content) - 1) && !message.channel.game.gameStatus().gameOver)), idle: 120000 });
          col2.on('collect', async (msg) => {
            if (msg.content === "terminate") {
              message.channel.send(`${msg.author.toString()} ended this game! See you soon!`, { allowedMentions: { parse: ["users"] } });
              return col2.stop("stoped");
            }
            msg.channel.game.play(parseInt(msg.content) - 1);
            if (msg.channel.game.gameStatus().gameOver && msg.channel.game.gameStatus().solution) {
              const res = await displayConnectFourBoard(displayBoard(message.channel.game.ascii()), msg.channel.game);
              message.channel.send({
                content: `${msg.author.toString()} won this game!`,
                files: [{ attachment: res, name: "connect4.gif" }],
                allowedMentions: { parse: ["users"] }
              });
              return col2.stop("winner");
            }
            else if (msg.channel.game.gameStatus().gameOver) {
              const res = await displayConnectFourBoard(displayBoard(message.channel.game.ascii()), message.channel.game);
              message.channel.send({
                content: `Great tier!`,
                files: [{ attachment: res, name: "connect4.gif" }],
                allowedMentions: { parse: ["users"] }
              });
              return col2.stop("tier");
            }
            const res = await displayConnectFourBoard(displayBoard(msg.channel.game.ascii()), msg.channel.game);
            message.channel.send({
              content: `${turns.get(message.author.id) == turns.get(msg.author.id) ? user.toString() : message.author.toString()}, it's your turn! [${turns.get(msg.author.id) == 2 ? "🔴" : "🟡"}]`,
              files: [{ attachment: res, name: "connect4.gif" }],
              allowedMentions: { parse: ["users"] }
            });
          })
          col2.on('end', (c, r) => {
            message.channel.game = null;
            turns.delete(user.id);
            turns.delete(message.author.id);
            if (r === "idle") {
              message.channel.send("Waiting time is over (2m)! Bye.");
            }
          })
        } else if (button.customId === "c4_c_vsno") {
          col.stop("rejected");
        }
      });
      col.on("end", (c, r) => {
        if (r === "ok") return c.last().update({ content: "Accepted", components: [new MessageActionRow().addComponents([but_yes.setDisabled(true), but_no.setDisabled(true)])] });
        else {
          message.channel.game = undefined;
          if (r === "rejected") c.last().update({ content: "The user declined the invitation. Try it with someone else.", components: [new MessageActionRow().addComponents([but_yes.setDisabled(true), but_no.setDisabled(true)])] });
          else if (r === "time") msg_response.edit({ content: "Time's up. Try it with someone else.", components: [new MessageActionRow().addComponents([but_yes.setDisabled(true), but_no.setDisabled(true)])] });
        }
      })
    }
  }
}
