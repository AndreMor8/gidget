import { MessageActionRow, MessageButton, Modal, TextInputComponent } from 'discord.js';
import BombSweeper from '../../utils/bombsweeper.js';

export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Minesweeper game, and no, they are not spoilers.";
  }
  async run(bot, interaction) {
    if (interaction.channel.isVoice()) return interaction.reply({ content: "Not yet supported in voice channel chat.", ephemeral: true });
    if (interaction.user.mine) return interaction.reply({ content: "There is already a game with you in progress!", ephemeral: true });
    interaction.user.mine = new BombSweeper();
    const to_edit = await interaction.deferReply({ fetchReply: true });
    const text_form = new TextInputComponent()
      .setCustomId("mine_text_ckc")
      .setLabel("Format: <vertical>,<horizontal>,<flag>")
      .setPlaceholder("Reveal: 0,0 / Flag: 0,0,f / Unflag: 0,0,rf")
      .setRequired(true)
      .setMaxLength(7)
      .setStyle("SHORT");
    const modal = new Modal()
      .setCustomId("mine_submit_ckc")
      .setTitle("Cell to modify")
      .addComponents(new MessageActionRow().addComponents(text_form));
    const ckc = new MessageButton()
      .setCustomId("mine_ckc")
      .setLabel("Ckeck/flag cell")
      .setStyle("PRIMARY");
    const stop = new MessageButton()
      .setCustomId("mine_stop")
      .setLabel("Stop")
      .setStyle("DANGER");
    const col = to_edit.createMessageComponentCollector({
      filter: (i) => {
        if (i.user.id !== interaction.user.id) i.reply({ content: "Use your own instance with /minesweeper", ephemeral: true }).catch(() => { });
        return i.user.id === interaction.user.id;
      }, idle: 300000
    });
    interaction.user.mine.onWin = () => col.stop("win");
    interaction.user.mine.onLoss = () => col.stop("loss");
    interaction.user.mine.PlaceBombs(10);
    let awatingModal = false;
    col.on("collect", async i => {
      try {
        switch (i.customId) {
          case "mine_stop":
            col.stop("exit");
            break;
          case "mine_ckc": {
            await i.showModal(modal);
            if (awatingModal) return;
            awatingModal = true;
            const submited = await i.awaitModalSubmit({ filter: (i) => i.customId === "mine_submit_ckc", time: 30000 }).catch(() => { });
            awatingModal = false;
            if (!submited) {
              if (interaction.user.mine) return interaction.followUp({ content: "The maximum response waiting time is 30s. Run the modal again...", ephemeral: true });
              else return;
            }
            const [pre_r, pre_c, flag] = submited.fields.getTextInputValue("mine_text_ckc").split(",");
            const [r, c] = [parseInt(pre_r), parseInt(pre_c)];
            if (isNaN(r)) return submited.reply({ content: "Invalid number.", ephemeral: true });
            if (isNaN(c)) return submited.reply({ content: "Invalid number.", ephemeral: true });
            if (r < 0 || r > 8) return submited.reply({ content: "Invalid number.", ephemeral: true });
            if (c < 0 || c > 8) return submited.reply({ content: "Invalid number.", ephemeral: true });
            try {
              if (flag == "f") {
                interaction.user.mine.setFlag(c, r);
                await submited.update(`__Minesweeper Game__ (${interaction.user}) (in progress)\n\n${interaction.user.mine.showToUser()}`);
              } else if (flag == "rf") {
                interaction.user.mine.removeFlag(c, r);
                await submited.update(`__Minesweeper Game__ (${interaction.user}) (in progress)\n\n${interaction.user.mine.showToUser()}`);
              } else {
                const can = interaction.user.mine.CheckCell(c, r);
                if (can) await submited.update(`__Minesweeper Game__ (${interaction.user}) (in progress)\n\n${interaction.user.mine.showToUser()}`);
                else await submited.deferUpdate();
              }
            } catch (err) {
              await submited.reply({ content: err.toString(), ephemeral: true });
            }
          }
            break;
        }
      } catch (err) {
        await interaction.followUp({ content: err.toString() });
      }
    });
    col.on("end", async (c, r) => {
      if (r === "win") {
        await new Promise(s => setTimeout(s, 1000));
        if (!to_edit.deleted) await interaction.editReply({ content: `__Minesweeper Game__ (${interaction.user}) (Won)\n\n${interaction.user.mine.showToUser()}`, components: [new MessageActionRow().addComponents([ckc.setDisabled(true), stop.setDisabled(true)])] });
        await interaction.followUp({ content: "You have won the minesweeper game :)", ephemeral: true });
      } else if (r === "loss") {
        if (!to_edit.deleted) await interaction.editReply({ content: `__Minesweeper Game__ (${interaction.user}) (Lost)\n\n${interaction.user.mine.showToUser()}`, components: [new MessageActionRow().addComponents([ckc.setDisabled(true), stop.setDisabled(true)])] });
        await interaction.followUp({ content: "You lost the minesweeper game :(", ephemeral: true });
      } else if (r === "exit") {
        await interaction.followUp("Well, it seems you don't want to play minesweeper.");
        if (!to_edit.deleted) await interaction.deleteReply().catch(() => { });
      } else if (r === "idle") {
        if (!to_edit.deleted) await interaction.editReply({ content: `__Minesweeper Game__ (${interaction.user}) (5m timeout)\n\n${interaction.user.mine.showToUser()}`, components: [new MessageActionRow().addComponents([ckc.setDisabled(true), stop.setDisabled(true)])] });
        await interaction.followUp({ content: "Time's up (5m)", ephemeral: true });
      }
      interaction.user.mine = null;
    });
    await interaction.editReply({ content: `__Minesweeper Game__ (${interaction.user}) (in progress)\n**Use \`Stop\` for leave the game.**\n\n${interaction.user.mine.showToUser()}`, components: [new MessageActionRow().addComponents([ckc, stop])] });
  }
}

