import notes from '../../database/models/notes.js';
import { EmbedBuilder } from 'discord.js';

export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Manage your notes";
    this.deployOptions.options = [{
      name: "view",
      description: "See the notes you have created",
      type: 1,
      options: [{
        name: "ephemeral",
        description: "Show notes privately (default)",
        type: 5,
        required: false
      }]
    },
    {
      name: "add",
      description: "Create a note",
      type: 1,
      options: [{
        name: "note",
        description: "The note itself",
        type: 3,
        required: true
      }]
    },
    {
      name: "remove",
      description: "Delete a note",
      type: 1,
      options: [{
        name: "id",
        description: "Note ID (use /notes view)",
        type: 4,
        required: false
      },
      {
        name: "all",
        description: "Delete all notes?",
        type: 5,
        required: false
      }]
    },
    {
      name: "update",
      description: "Update a note",
      type: 1,
      options: [{
        name: "id",
        description: "Note ID (use /notes view)",
        type: 4,
        required: true
      },
      {
        name: "note",
        description: "The note itself",
        type: 3,
        required: true
      }]
    }]
  }
  async run(bot, interaction) {
    switch (interaction.options.getSubcommand()) {
      case "add": {
        if ((await notes.find({ userID: { $eq: interaction.user.id } })).length >= 25) return await interaction.reply({ content: "You can only have 25 notes.", ephemeral: true });
        const note = interaction.options.getString('note');
        if (note.length > 230) return await interaction.reply({ content: "Only 230 characters per note.", ephemeral: true });
        await notes.create({ userID: interaction.user.id, note });
        await interaction.reply({ content: "I've created your note successfully.", ephemeral: true });
      }
        break;
      case "remove": {
        const all = interaction.options.getBoolean('all', false);
        const id = interaction.options.getInteger("id");
        if (all) {
          const results = await notes.deleteMany({ userID: { $eq: interaction.user.id } });
          await interaction.reply({ content: `I have deleted ${results.deletedCount} notes of yours.`, ephemeral: true });
        } else {
          if (!id) return await interaction.reply({ content: "Invalid ID!", ephemeral: true });
          const arr = await notes.find({ userID: { $eq: interaction.user.id } });
          const i = id - 1;
          if (!arr[i]) return await interaction.reply({ content: "That note ID does not exist.", ephemeral: true });
          await arr[i].deleteOne();
          await interaction.reply({ content: "I've deleted that note", ephemeral: true });
        }
      }
        break;
      case "update": {
        const id = interaction.options.getInteger("id");
        if (!id) return await interaction.reply({ content: "Invalid ID!", ephemeral: true });
        const arr = await notes.find({ userID: { $eq: interaction.user.id } });
        const i = id - 1;
        if (!arr[i]) return await interaction.reply({ content: "That note ID does not exist.", ephemeral: true });
        const note = interaction.options.getString("note");
        if (note.length > 230) return await interaction.reply({ content: "Only 230 characters per note.", ephemeral: true });
        await arr[i].updateOne({ $set: { note } });
        await interaction.reply({ content: "I've updated that note", ephemeral: true });
      }
        break;
      case "view": {
        const arr = await notes.find({ userID: { $eq: interaction.user.id } });
        if (!arr[0]) return await interaction.reply({ content: "You don't have notes", ephemeral: true });

        const embed = new EmbedBuilder()
          .setTitle("Notes from " + interaction.user.username)
          .setColor("Blue")
          .setTimestamp();

        for (const i in arr) embed.addFields([{ name: `${parseInt(i) + 1}.`, value: arr[i].note }]);

        let ephemeral;
        const ep = interaction.options.getBoolean('ephemeral', false);
        if (typeof ep === "boolean" && !ep) ephemeral = false;
        else ephemeral = true;

        await interaction.reply({ embeds: [embed], ephemeral });
      }
    }
  }
}
