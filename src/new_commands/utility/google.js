import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import googleIt from 'google-it';
import google from 'google-img-scrap';
// eslint-disable-next-line
import { checkCleanUrl } from '../../utils/clean-url.js';

export default class extends SlashCommand {
  constructor(options) {
    super(options)
    this.deployOptions.description = "Search things in Google";
    this.deployOptions.options = [{
      name: "search",
      description: "Normal Google search",
      type: "SUB_COMMAND",
      options: [{
        name: "query",
        description: "Search term",
        type: "STRING",
        required: true
      }]
    },
    {
      name: "images",
      description: "Google Images search",
      type: "SUB_COMMAND",
      options: [{
        name: "query",
        description: "Search term",
        type: "STRING",
        required: true
      }]
    }];
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 16384n]
    };
  }
  async run(bot, interaction) {
    switch (interaction.options.getSubcommand()) {
      case "search": {
        const tosearch = interaction.options.getString("query");
        if (bot.badwords.isProfane(tosearch) && !interaction.channel.nsfw) return interaction.reply("To order this content go to an NSFW channel.");

        const results = await googleIt({ 'query': tosearch, 'limit': 7, disableConsole: true });

        if (!results.length) return interaction.reply("I didn't find anything");
        if (results.some(e => checkCleanUrl(e.link)) && !interaction.channel.nsfw) return interaction.reply("Your search includes NSFW content. To order this content go to an NSFW channel.");
        if (results.some(e => (bot.badwords.isProfane(e.title.toLowerCase()) || bot.badwords.isProfane(e.snippet.toLowerCase()))) && !interaction.channel.nsfw) return interaction.reply("Your search includes NSFW content. To order this content go to an NSFW channel.");

        let text = '';
        let i = 0;
        for (const elements of Object.values(results)) {
          i++
          const toadd = `${i}. [${elements.title}](${elements.link})\n${elements.snippet}\n\n`;
          if ((text.length + toadd.length) > 2040) break;
          text += toadd;
        }
        const embed = new MessageEmbed()
          .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
          .setColor('RANDOM')
          .setTitle('Google Search Results')
          .setDescription(text)
          .setFooter({ text: 'Powered by Google-it' })
          .addField('Time', ((Date.now() - interaction.createdTimestamp) / 1000) + 's', true)
          .setTimestamp();
        const but_link_google = new MessageButton()
          .setStyle("LINK")
          .setURL(`https://www.google.com/search?q=${tosearch.split(" ").join("+")}`)
          .setLabel("Google search link");

        await interaction.reply({ embeds: [embed], components: [new MessageActionRow().addComponents([but_link_google])] });
      }
        break;
      case "images": {
        const query = {
          search: interaction.options.getString("query"),
          safeSearch: !interaction.channel.nsfw,
          query: {
            SIZE: google.GOOGLE_QUERY.SIZE.LARGE
          },
          execute(element) {
            if (!element.url.match('gstatic.com')) return element;
          }
        };

        const { result: results } = await google.GOOGLE_IMG_SCRAP(query);
        if (!results.length) return interaction.reply("I didn't find anything.");

        const urls = results.map(e => e.url);
        let i = 0;
        const max = urls.length - 1;
        const embed = new MessageEmbed()
          .setTitle("Image search: " + interaction.options.getString("query"))
          .setDescription(`Use the buttons to move from one image to another`)
          .setFooter({ text: `${i + 1}/${max + 1}` })
          .setImage(urls[i])
          .setColor("RANDOM");

        const but_back = new MessageButton()
          .setCustomId("image_c_back")
          .setStyle("SECONDARY")
          .setLabel("Back")
          .setDisabled(true);

        const but_stop = new MessageButton()
          .setCustomId("image_c_stop")
          .setStyle("DANGER")
          .setLabel("Stop");

        const but_next = new MessageButton()
          .setCustomId("image_c_next")
          .setStyle("SECONDARY")
          .setLabel("Next");

        const filter = (button) => {
          if (button.user.id !== interaction.user.id) button.reply({ content: "Use your own instance by using `/image <query>`", ephemeral: true });
          return button.user.id === interaction.user.id;
        };
        const msg = await interaction.reply({ embeds: [embed], components: [new MessageActionRow().addComponents([but_back, but_stop, but_next])], fetchReply: true });

        const collector = msg.createMessageComponentCollector({ filter, idle: 30000 });
        collector.on('collect', async (button) => {
          if (button.customId === 'image_c_next') {
            if (max !== i) {
              i++
              embed.setImage(urls[i])
              embed.setFooter({ text: `${i + 1}/${max + 1}` })
              await button.update({ embeds: [embed], components: [new MessageActionRow().addComponents(((max === i ? [but_back.setDisabled(false), but_stop, but_next.setDisabled(true)] : [but_back.setDisabled(false), but_stop, but_next.setDisabled(false)])))] });
            }
          }
          if (button.customId === 'image_c_back') {
            if (i !== 0) {
              i--
              embed.setImage(urls[i])
              embed.setFooter({ text: `${i + 1}/${max + 1}` })
              await button.update({ embeds: [embed], components: [new MessageActionRow().addComponents(((i === 0 ? [but_back.setDisabled(true), but_stop, but_next.setDisabled(false)] : [but_back.setDisabled(false), but_stop, but_next.setDisabled(false)])))] });
            }
          }
          if (button.customId === 'image_c_stop') collector.stop("stoped")
        })
        collector.on('end', (c, r) => {
          if (r === "stoped") c.last().update({ embeds: [embed], components: [new MessageActionRow().addComponents([but_back.setDisabled(true), but_stop.setDisabled(true), but_next.setDisabled(true)])] })
          else if (!msg.deleted) interaction.editReply({ embeds: [embed], components: [new MessageActionRow().addComponents([but_back.setDisabled(true), but_stop.setDisabled(true), but_next.setDisabled(true)])] }).catch(() => { });
        });
      }
        break;
    }
  }
}