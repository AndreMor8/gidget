import { MessageEmbed } from "discord.js";
export default class extends SlashCommand {
  constructor(options) {
    super(options)
    this.deployOptions.description = "Limit the use of an emoji to certain roles.";
    this.deployOptions.options = [
      {
        name: "view",
        description: "See if the emoji is limited to roles.",
        type: "SUB_COMMAND",
        options: [{
          name: "emoji",
          description: "Emoji to check.",
          type: "STRING",
          required: true,
        }]
      },
      {
        name: "update",
        description: "Did the members get new roles? Use this if newcomers still don't see the respective emojis.",
        type: "SUB_COMMAND"
      },
      {
        name: "add",
        description: "Add roles to emoji",
        type: "SUB_COMMAND",
        options: [{
          name: "emoji",
          description: "The emoji to limit use",
          type: "STRING",
          required: true
        },
        {
          name: "role",
          description: "Role to add",
          type: "ROLE",
          required: true
        }]
      },
      {
        name: "remove",
        description: "Remove roles to emoji",
        type: "SUB_COMMAND",
        options: [{
          name: "emoji",
          description: "The emoji to limit use",
          type: "STRING",
          required: true
        },
        {
          name: "role",
          description: "Role to remove",
          type: "ROLE",
          required: true
        }]
      }
    ]
    this.guildonly = true;
    this.permissions = {
      user: [1073741824n, 0n],
      bot: [1073741824n, 0n]
    };
  }
  // eslint-disable-next-line require-await
  async run(bot, interaction) {
    const elist = await interaction.guild.emojis.fetch();
    switch (interaction.options.getSubcommand()) {
      case "view": {
        const e = interaction.options.getString('emoji');
        const resolvedEmoji = elist.get(e) || elist.find(a => a.name === e || a.toString() === e);
        if (!resolvedEmoji) return interaction.reply("This isn't a correct custom guild emoji!");
        if (!resolvedEmoji.roles.cache.first()) return interaction.reply("That emoji can be used by anyone");
        const text = resolvedEmoji.roles.cache.map(e => e.toString()).join("\n");
        const embed = new MessageEmbed()
          .setTitle("List of roles they can use " + resolvedEmoji.name)
          .setDescription(text);
        await interaction.reply({ embeds: [embed] });
      }
        break;
      case "update": {
        const col = elist.filter(e => e.roles.cache.first());
        if (!col.first()) return interaction.reply("There are no emojis to update");
        col.each(e => {
          const c = e.roles.cache;
          e.edit({ roles: c });
        });
        await interaction.reply("Done, new role members should now be able to use the emoji");
      }
        break;
      case "add": {
        const e = interaction.options.getString('emoji');
        const resolvedEmoji = elist.get(e) || elist.find(a => a.name === e || a.toString() === e);
        if (!resolvedEmoji) return interaction.reply("This isn't a correct custom guild emoji!");
        const role = interaction.options.getRole("role");
        resolvedEmoji.roles.add(role).then(() => interaction.reply("Ok. I've put the roles correctly")).catch(err => interaction.reply("Some error ocurred! Here's a debug: " + err));
      }
        break;
      case "remove": {
        const e = interaction.options.getString('emoji');
        const resolvedEmoji = elist.get(e) || elist.find(a => a.name === e || a.toString() === e);
        if (!resolvedEmoji) return interaction.reply("This isn't a correct custom guild emoji!");
        const role = interaction.options.getRole("role");
        resolvedEmoji.roles.remove(role).then(() => interaction.reply("Ok. I've put the roles correctly")).catch(err => interaction.reply("Some error ocurred! Here's a debug: " + err));
      }
        break;
    }
  }
}