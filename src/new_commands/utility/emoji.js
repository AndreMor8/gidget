import { Util, MessageEmbed, MessageButton, MessageActionRow } from "discord.js";
export default class extends SlashCommand {
  constructor(options) {
    super(options)
    this.deployOptions.description = "Limit the use of an emoji to certain roles.";
    this.deployOptions.options = [
      {
        name: "info",
        description: "Get information from an emoji.",
        type: "SUB_COMMAND",
        options: [{
          name: "emoji",
          description: "Emoji to see",
          type: "STRING",
          required: true
        }]
      },
      {
        name: "all",
        description: "Show all guild emojis",
        type: "SUB_COMMAND"
      },
      {
        name: "limit",
        description: "Limit the use of an emoji to certain roles.",
        type: "SUB_COMMAND_GROUP",
        options: [
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
        }]
      }
    ]
    this.guildonly = true;
    this.permissions = {
      user: [1073741824n, 0n],
      bot: [1073741824n, 0n]
    };
  }
  async run(bot, interaction) {
    const elist = await interaction.guild.emojis.fetch();
    switch (interaction.options.getSubcommand()) {
      case "info": {
        const e = interaction.options.getString('emoji');
        const emoji = bot.emojis.cache.get(e) ||
          bot.emojis.cache.find(a => a.toString() === e || a.identifier === e) ||
          elist.find(a => a.name === e || a.toString() === e || a.identifier === e) ||
          elist.get(e);
        if (!emoji) return interaction.reply({ content: "Invalid emoji!", ephemeral: true });
        let auth = emoji.author;
        if (!auth && interaction.guild.me.permissions.has("MANAGE_EMOJIS_AND_STICKERS") && emoji.guild.id === interaction.guild.id) {
          auth = await emoji.fetchAuthor();
        } else if (!auth) auth = "*Without perms to see that*";
        const embed = new MessageEmbed()
          .setTitle("Emoji info for " + emoji.name)
          .setThumbnail(emoji.url)
          .setColor("RANDOM")
          .addField("ID", emoji.id, true)
          .addField("Use", "`" + emoji.toString() + "`", true)
          .addField("Animated?", emoji.animated ? "Yes" : "No", true)
          .addField("Managed?", emoji.managed ? "Yes" : "No", true)
          .addField("Requires colons?", emoji.requiresColons ? "Yes" : "No", true)
          .addField("Available", emoji.available ? "Yes" : "No", true)
          .setFooter({ text: "Created at" })
          .setTimestamp(emoji.createdAt);
        if (emoji.guild.id === interaction.guild.id) {
          embed.addField("Author", auth.toString(), true)
            .addField("Roles that can use the emoji", emoji.roles.cache.first() ? emoji.roles.cache.map(e => `${e}`).join(", ") : "@everyone");
        }
        const but_emoji_link = new MessageButton()
          .setStyle("LINK")
          .setURL(emoji.url)
          .setLabel("Emoji link/URL");
        await interaction.reply({ embeds: [embed], components: [new MessageActionRow().addComponents([but_emoji_link])], ephemeral: true });
      }
        break;
      case "all": {
        const allEmojis = elist;

        const fullN = allEmojis.size;

        if (fullN < 1)
          return interaction.reply({ content: "I don't see any emoji here.", ephemeral: true });

        const commonN = allEmojis.filter(e => e.available && !e.animated && (e.roles.cache.size >= 1 ? e.roles.cache.intersect(interaction.guild.me.roles.cache).size >= 1 : true)).size;
        const animatedN = allEmojis.filter(e => e.available && e.animated && (e.roles.cache.size >= 1 ? e.roles.cache.intersect(interaction.guild.me.roles.cache).size >= 1 : true)).size;
        const cantuse = allEmojis.filter(e => e.available && e.roles.cache.size >= 1 ? e.roles.cache.intersect(interaction.guild.me.roles.cache).size < 1 : false).size;

        const atext = allEmojis.filter(e => e.available && e.animated && (e.roles.cache.size >= 1 ? e.roles.cache.intersect(interaction.guild.me.roles.cache).size >= 1 : true)).map(e => e.toString()).join(" ");
        const ntext = allEmojis.filter(e => e.available && !e.animated && (e.roles.cache.size >= 1 ? e.roles.cache.intersect(interaction.guild.me.roles.cache).size >= 1 : true)).map(e => e.toString()).join(" ");
        const ctext = allEmojis.filter(e => e.available && e.roles.cache.size >= 1 ? e.roles.cache.intersect(interaction.guild.me.roles.cache).size < 1 : false).map(e => e.name).join(", ");
        const utext = allEmojis.filter(e => !e.available).map(e => e.name).join(", ");
        const unavailable = allEmojis.filter(e => !e.available).size;
        let realtext = "";

        let a = false;
        let n = false;
        let c = false;

        if (animatedN > 0) {
          a = true;
          realtext += `**Animated (${animatedN}): ** ${atext}\n`;
        }

        if (commonN > 0) {
          n = true;
          if (a) realtext += `\n**Common (${commonN}): ** ${ntext}\n`;
          else realtext += `**Common (${commonN}): ** ${ntext}\n`;
        }

        if (cantuse > 0) {
          c = true;
          if (n) realtext += `\n**I can't use (${cantuse}): ** ${ctext}\n`;
          else realtext += `**I can't use (${cantuse}): ** ${ctext}\n`;
        }

        if (unavailable > 0) {
          if (c) realtext += `\n\n**Unavailable (${unavailable}): ** ${utext}\n`;
          else realtext += `**Unavailable (${unavailable}): ** ${utext}\n`;
        }
        const contents = Util.splitMessage(realtext, { char: " ", maxLength: 2000 });
        for (const content of contents) {
          if (interaction.replied) await interaction.followUp({ content, ephemeral: true });
          else await interaction.reply({ content, ephemeral: true });
        }
      }
        break;
      case "update": {
        if (!interaction.member.permissions.has("MANAGE_EMOJIS_AND_STICKERS")) return interaction.reply("You don't have permissions to run this command. Required: `MANAGE_EMOJIS_AND_STICKERS`");
        if (!interaction.guild.me.permissions.has("MANAGE_EMOJIS_AND_STICKERS")) return interaction.reply("I don't have permissions to run this command. Required: `MANAGE_EMOJIS_AND_STICKERS`");
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
        if (!interaction.member.permissions.has("MANAGE_EMOJIS_AND_STICKERS")) return interaction.reply("You don't have permissions to run this command. Required: `MANAGE_EMOJIS_AND_STICKERS`");
        if (!interaction.guild.me.permissions.has("MANAGE_EMOJIS_AND_STICKERS")) return interaction.reply("I don't have permissions to run this command. Required: `MANAGE_EMOJIS_AND_STICKERS`");
        const e = interaction.options.getString('emoji');
        const resolvedEmoji = elist.get(e) || elist.find(a => a.name === e || a.toString() === e || a.identifier === e);
        if (!resolvedEmoji) return interaction.reply("This isn't a correct custom guild emoji!");
        const role = interaction.options.getRole("role");
        resolvedEmoji.roles.add(role).then(() => interaction.reply("Ok. I've put the roles correctly")).catch(err => interaction.reply("Some error ocurred! Here's a debug: " + err));
      }
        break;
      case "remove": {
        if (!interaction.member.permissions.has("MANAGE_EMOJIS_AND_STICKERS")) return interaction.reply("You don't have permissions to run this command. Required: `MANAGE_EMOJIS_AND_STICKERS`");
        if (!interaction.guild.me.permissions.has("MANAGE_EMOJIS_AND_STICKERS")) return interaction.reply("I don't have permissions to run this command. Required: `MANAGE_EMOJIS_AND_STICKERS`");
        const e = interaction.options.getString('emoji');
        const resolvedEmoji = elist.get(e) || elist.find(a => a.name === e || a.toString() === e || a.identifier === e);
        if (!resolvedEmoji) return interaction.reply("This isn't a correct custom guild emoji!");
        const role = interaction.options.getRole("role");
        resolvedEmoji.roles.remove(role).then(() => interaction.reply("Ok. I've put the roles correctly")).catch(err => interaction.reply("Some error ocurred! Here's a debug: " + err));
      }
        break;
    }
  }
}