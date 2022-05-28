import { MessageButton, MessageActionRow } from 'discord.js';
import Board from '../../utils/tictactoe-board.js';
import ai from 'tictactoe-complex-ai';

export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Now it comes with 4 difficulty levels!";
    this.deployOptions.options = [{
      name: "user",
      description: "With which user will you play?",
      type: "USER",
      required: false
    },
    {
      name: "difficulty",
      description: "Choose a difficulty level to play with the bot (default difficulty 'Medium')",
      type: "STRING",
      choices: [{
        name: "Easy",
        value: "easy"
      },
      {
        name: "Medium",
        value: "medium"
      },
      {
        name: "Hard",
        value: "hard"
      },
      {
        name: "Expert",
        value: "expert"
      }],
      required: false
    }];
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 0n]
    }
  }
  async run(bot, interaction) {
    let user = interaction.options.getUser("user");
    const difficulty = interaction.options.getString("difficulty");
    if (!user && !difficulty) return await interaction.reply({ content: `How to play TicTacToe on Discord?\n\n1. Do \`/tictactoe user:<someone>\`. It can be me or someone else.\n2. If you selected someone else, the person will be asked if they want to play. If you selected me then the game starts immediately. You can also make it difficult to play with me (\`/tictactoe difficulty:<Easy to Expert>\`).\n3. Now you should start playing calmly as you should. The winner is the one who makes a row, column, or diagonal with their token\n4. If someone no longer wants to play, they can press the \`terminate\` button to log out.\n5. If no one answers in less than 2 minutes the game is over.\n\nHappy playing!`, ephemeral: true });
    if (user && difficulty) {
      if (user.id !== bot.user.id) return await interaction.reply({ content: "The difficulty is only chosen when playing with the bot!" });
    }
    if (!user && difficulty) user = bot.user;
    if (interaction.channel.tttgame) return await interaction.reply({ content: "There is already a game going on this channel. Please wait for it to finish or go to another channel.", ephemeral: true });

    if ((user.id === interaction.user.id) || (user.bot && user.id !== bot.user.id)) return interaction.reply({ content: "Invalid member!", ephemeral: true });

    //STARTING GAME
    interaction.channel.tttgame = new Board();
    const terminateButton = new MessageButton()
      .setCustomId("ttt_g_terminate")
      .setLabel("Terminate")
      .setStyle("DANGER");
    if (user.id === bot.user.id) {
      //const difficulty = ["expert", "hard", "medium", "easy"].includes(args[1].toLowerCase()) ? args[1].toLowerCase() : "medium";
      const res = interaction.channel.tttgame.grid.map(buttonMap);
      //Only applicable here. X is supposed to be the local and O is the guest, but you can't do that with the bot.
      const randomturn = Boolean(Math.round(Math.random()));
      const aiInstance = ai.createAI({ level: difficulty, ai: randomturn ? 'X' : 'O', player: randomturn ? 'O' : 'X' });
      const finalMsg = await interaction.reply({
        content: `${randomturn ? bot.user.toString() : interaction.user.toString()}'s turn`,
        allowedMentions: { parse: ["users"] },
        components: [new MessageActionRow().addComponents([res[0], res[1], res[2]]), new MessageActionRow().addComponents([res[3], res[4], res[5]]), new MessageActionRow().addComponents([res[6], res[7], res[8]]), new MessageActionRow().addComponents([terminateButton])],
        fetchReply: true
      });
      const col2 = finalMsg.createMessageComponentCollector({
        filter: async button => {
          if (![interaction.user.id].includes(button.user.id)) await button.reply({ content: "Use your own instance by using `g%ttt`", ephemeral: true });
          const seeTurn = Boolean(button.channel.tttgame.availablePositionCount() % 2);
          const turn = randomturn ? (seeTurn ? bot.user.id : interaction.user.id) : (seeTurn ? interaction.user.id : bot.user.id);
          if (turn !== button.user.id && !button.replied) await button.reply({ content: "It's not your turn yet!", ephemeral: true });
          return ([interaction.user.id].includes(button.user.id) && turn === button.user.id);
        }, idle: 120000
      });
      col2.on('collect', async (button) => {
        if (button.customId === "ttt_g_terminate") return col2.stop("stoped")
        const userRes = parseInt(button.customId.split("_")[2]);
        if (button.channel.tttgame.isPositionTaken(userRes + 1)) return button.deferUpdate();
        button.channel.tttgame = button.channel.tttgame.makeMove(userRes + 1, randomturn ? "O" : "X");
        if (button.channel.tttgame.isGameOver()) {
          if (button.channel.tttgame.hasWinner()) {
            const res = button.channel.tttgame.grid.map(buttonMap);
            button.update({
              content: `${interaction.user.toString()} won this game!`,
              allowedMentions: { parse: ["users"] },
              components: [new MessageActionRow().addComponents([res[0].setDisabled(true), res[1].setDisabled(true), res[2].setDisabled(true)]), new MessageActionRow().addComponents([res[3].setDisabled(true), res[4].setDisabled(true), res[5].setDisabled(true)]), new MessageActionRow().addComponents([res[6].setDisabled(true), res[7].setDisabled(true), res[8].setDisabled(true)]), new MessageActionRow().addComponents([terminateButton.setDisabled(true)])]
            });
            return col2.stop("winner");
          } else if (button.channel.tttgame.isGameDraw()) {
            const res = button.channel.tttgame.grid.map(buttonMap);
            button.update({
              content: `Great draw!`,
              allowedMentions: { parse: ["users"] },
              components: [new MessageActionRow().addComponents([res[0].setDisabled(true), res[1].setDisabled(true), res[2].setDisabled(true)]), new MessageActionRow().addComponents([res[3].setDisabled(true), res[4].setDisabled(true), res[5].setDisabled(true)]), new MessageActionRow().addComponents([res[6].setDisabled(true), res[7].setDisabled(true), res[8].setDisabled(true)]), new MessageActionRow().addComponents([terminateButton.setDisabled(true)])]
            });
            return col2.stop("draw");
          }
        }
        const res1 = button.channel.tttgame.grid.map(buttonMap);
        await button.update({
          content: `${bot.user.toString()}'s turn`,
          allowedMentions: { parse: ["users"] },
          components: [new MessageActionRow().addComponents([res1[0], res1[1], res1[2]]), new MessageActionRow().addComponents([res1[3], res1[4], res1[5]]), new MessageActionRow().addComponents([res1[6], res1[7], res1[8]]), new MessageActionRow().addComponents([terminateButton])]
        });

        const aiRes = await aiInstance.play(button.channel.tttgame.grid);
        button.channel.tttgame = button.channel.tttgame.makeMove(aiRes + 1, randomturn ? "X" : "O");
        if (button.channel.tttgame.isGameOver()) {
          if (button.channel.tttgame.hasWinner()) {
            const res = button.channel.tttgame.grid.map(buttonMap);
            interaction.editReply({
              content: `${bot.user.toString()} won this game!`,
              allowedMentions: { parse: ["users"] },
              components: [new MessageActionRow().addComponents([res[0].setDisabled(true), res[1].setDisabled(true), res[2].setDisabled(true)]), new MessageActionRow().addComponents([res[3].setDisabled(true), res[4].setDisabled(true), res[5].setDisabled(true)]), new MessageActionRow().addComponents([res[6].setDisabled(true), res[7].setDisabled(true), res[8].setDisabled(true)]), new MessageActionRow().addComponents([terminateButton.setDisabled(true)])]
            });
            return col2.stop("winner");
          } else if (button.channel.tttgame.isGameDraw()) {
            const res = button.channel.tttgame.grid.map(buttonMap);
            interaction.editReply({
              content: `Great draw!`,
              allowedMentions: { parse: ["users"] },
              components: [new MessageActionRow().addComponents([res[0].setDisabled(true), res[1].setDisabled(true), res[2].setDisabled(true)]), new MessageActionRow().addComponents([res[3].setDisabled(true), res[4].setDisabled(true), res[5].setDisabled(true)]), new MessageActionRow().addComponents([res[6].setDisabled(true), res[7].setDisabled(true), res[8].setDisabled(true)]), new MessageActionRow().addComponents([terminateButton.setDisabled(true)])]
            });
            return col2.stop("draw");
          }
        }
        const res = button.channel.tttgame.grid.map(buttonMap);
        await interaction.editReply({
          content: `${interaction.user.toString()}'s turn`,
          allowedMentions: { parse: ["users"] },
          components: [new MessageActionRow().addComponents([res[0], res[1], res[2]]), new MessageActionRow().addComponents([res[3], res[4], res[5]]), new MessageActionRow().addComponents([res[6], res[7], res[8]]), new MessageActionRow().addComponents([terminateButton])]
        });
      });

      col2.on('end', async (c, r) => {
        const res = interaction.channel.tttgame.grid.map(buttonMap);
        if (r === "stoped") await c.last().update({
          content: r === "idle" ? "Timeout (2m)" : `Game terminated by ${interaction.user.toString()}`,
          components: [new MessageActionRow().addComponents([res[0].setDisabled(true), res[1].setDisabled(true), res[2].setDisabled(true)]), new MessageActionRow().addComponents([res[3].setDisabled(true), res[4].setDisabled(true), res[5].setDisabled(true)]), new MessageActionRow().addComponents([res[6].setDisabled(true), res[7].setDisabled(true), res[8].setDisabled(true)]), new MessageActionRow().addComponents([terminateButton.setDisabled(true)])]
        });
        if (r === "stoped") c.last().followUp("You ended this game. See you soon!")
        if (r === "idle") finalMsg.reply("Waiting time is over (2m)! Bye.");
        interaction.channel.tttgame = undefined;
      });
      if (randomturn) {
        const aiRes = await aiInstance.play(interaction.channel.tttgame.grid);
        if (!col2.ended || interaction.channel.tttgame) {
          interaction.channel.tttgame = interaction.channel.tttgame.makeMove(aiRes + 1, "X");
          const res = interaction.channel.tttgame.grid.map(buttonMap);
          await interaction.editReply({
            content: `${interaction.user.toString()}'s turn`,
            allowedMentions: { parse: ["users"] },
            components: [new MessageActionRow().addComponents([res[0], res[1], res[2]]), new MessageActionRow().addComponents([res[3], res[4], res[5]]), new MessageActionRow().addComponents([res[6], res[7], res[8]]), new MessageActionRow().addComponents([terminateButton])]
          });
        }

      }
    } else {
      const but_yes = new MessageButton()
        .setCustomId("ttt_c_vsyes")
        .setStyle("SUCCESS")
        .setLabel("Yes");
      const but_no = new MessageButton()
        .setCustomId("ttt_c_vsno")
        .setStyle("DANGER")
        .setLabel("No");

      const msg_response = await interaction.reply({ content: `Hey ${user.toString()}, do you want to play TicTacToe with ${interaction.user.toString()}?`, allowedMentions: { parse: ["users"] }, components: [new MessageActionRow().addComponents([but_yes, but_no])], fetchReply: true });
      const col = msg_response.createMessageComponentCollector({
        filter: (b) => {
          if (b.user.id !== user.id) b.reply({ content: "You are not the expecting user!", ephemeral: true });
          return b.user.id === user.id;
        }, time: 60000
      });

      col.on("collect", async (button) => {
        if (button.customId === "ttt_c_vsyes") {
          col.stop("ok");
          const res = button.channel.tttgame.grid.map(buttonMap);
          const finalMsg = await interaction.followUp({
            content: `${interaction.user.toString()}'s turn`,
            allowedMentions: { parse: ["users"] },
            components: [new MessageActionRow().addComponents([res[0], res[1], res[2]]), new MessageActionRow().addComponents([res[3], res[4], res[5]]), new MessageActionRow().addComponents([res[6], res[7], res[8]]), new MessageActionRow().addComponents([terminateButton])]
          });
          const col2 = finalMsg.createMessageComponentCollector({
            filter: async button => {
              if (![interaction.user.id, user.id].includes(button.user.id)) await button.reply({ content: "Use your own instance by using `g%ttt`", ephemeral: true });
              const turn = button.channel.tttgame.currentMark() === "X" ? interaction.user.id : user.id;
              if (turn !== button.user.id && button.customId !== "ttt_g_terminate" && !button.replied) await button.reply({ content: "It's not your turn yet!", ephemeral: true });
              return ([interaction.user.id, user.id].includes(button.user.id) && (button.customId === "ttt_g_terminate" || turn === button.user.id));
            }, idle: 120000
          });
          col2.on('collect', async (button) => {
            if (button.customId === "ttt_g_terminate") return col2.stop("stoped")
            const userRes = parseInt(button.customId.split("_")[2]);
            if (button.channel.tttgame.isPositionTaken(userRes + 1)) return button.deferUpdate();
            button.channel.tttgame = button.channel.tttgame.makeMove(userRes + 1, button.channel.tttgame.currentMark());
            if (button.channel.tttgame.isGameOver()) {
              if (button.channel.tttgame.hasWinner()) {
                const res = button.channel.tttgame.grid.map(buttonMap);
                button.update({
                  content: `${button.user.toString()} won this game!`,
                  allowedMentions: { parse: ["users"] },
                  components: [new MessageActionRow().addComponents([res[0].setDisabled(true), res[1].setDisabled(true), res[2].setDisabled(true)]), new MessageActionRow().addComponents([res[3].setDisabled(true), res[4].setDisabled(true), res[5].setDisabled(true)]), new MessageActionRow().addComponents([res[6].setDisabled(true), res[7].setDisabled(true), res[8].setDisabled(true)]), new MessageActionRow().addComponents([terminateButton.setDisabled(true)])]
                });
                return col2.stop("winner");
              } else if (button.channel.tttgame.isGameDraw()) {
                const res = button.channel.tttgame.grid.map(buttonMap);
                button.update({
                  content: `Great draw!`,
                  allowedMentions: { parse: ["users"] },
                  components: [new MessageActionRow().addComponents([res[0].setDisabled(true), res[1].setDisabled(true), res[2].setDisabled(true)]), new MessageActionRow().addComponents([res[3].setDisabled(true), res[4].setDisabled(true), res[5].setDisabled(true)]), new MessageActionRow().addComponents([res[6].setDisabled(true), res[7].setDisabled(true), res[8].setDisabled(true)]), new MessageActionRow().addComponents([terminateButton.setDisabled(true)])]
                });
                return col2.stop("draw");
              }
            }
            const res = button.channel.tttgame.grid.map(buttonMap);
            await button.update({
              content: `${button.channel.tttgame.currentMark() === "X" ? interaction.user.toString() : user.toString()}'s turn`,
              allowedMentions: { parse: ["users"] },
              components: [new MessageActionRow().addComponents([res[0], res[1], res[2]]), new MessageActionRow().addComponents([res[3], res[4], res[5]]), new MessageActionRow().addComponents([res[6], res[7], res[8]]), new MessageActionRow().addComponents([terminateButton])]
            });
          })
          col2.on('end', async (c, r) => {
            const res = interaction.channel.tttgame.grid.map(buttonMap);
            if (r === "stoped") await c.last().update({
              content: r === "idle" ? "Timeout (2m)" : `Game terminated by ${c.last().user.toString()}`,
              components: [new MessageActionRow().addComponents([res[0].setDisabled(true), res[1].setDisabled(true), res[2].setDisabled(true)]), new MessageActionRow().addComponents([res[3].setDisabled(true), res[4].setDisabled(true), res[5].setDisabled(true)]), new MessageActionRow().addComponents([res[6].setDisabled(true), res[7].setDisabled(true), res[8].setDisabled(true)]), new MessageActionRow().addComponents([terminateButton.setDisabled(true)])]
            });
            if (r === "stoped") c.last().followUp("You ended this game! See you soon!");
            if (r === "idle") interaction.followUp("Waiting time is over (2m)! Bye.");
            interaction.channel.tttgame = undefined;
          })
        } else if (button.customId === "ttt_c_vsno") {
          col.stop("rejected");
        }
      });
      col.on("end", async (c, r) => {
        if (r === "ok") return c.last().update({ content: "Accepted", components: [new MessageActionRow().addComponents([but_yes.setDisabled(true), but_no.setDisabled(true)])] });
        else {
          if (r === "rejected") await c.last().update({ content: "The user declined the invitation. Try it with someone else.", components: [new MessageActionRow().addComponents([but_yes.setDisabled(true), but_no.setDisabled(true)])] });
          else if (r === "time") await interaction.editReply({ content: "Time's up. Try it with someone else.", components: [new MessageActionRow().addComponents([but_yes.setDisabled(true), but_no.setDisabled(true)])] });
          interaction.channel.tttgame = undefined;
        }
      })
    }

  }
}

function buttonMap(e, i) {
  return new MessageButton()
    .setStyle(e === '' ? "SECONDARY" : undefined || e === "X" ? "DANGER" : undefined || e === "O" ? "PRIMARY" : undefined)
    .setCustomId(`ttt_g_${i}`)
    .setLabel(e || "?")
    .setDisabled(e !== '');
}
