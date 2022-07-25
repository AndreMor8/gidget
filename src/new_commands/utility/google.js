import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import googleIt from 'google-it';
import google from 'google-img-scrap';
import { default as gtranslate, languages } from 'google-translate-api-x';
// eslint-disable-next-line
import { checkCleanUrl } from '../../utils/clean-url.js';
import { splitMessage } from '../../extensions.js';

export default class extends SlashCommand {
  constructor(options) {
    super(options)
    this.deployOptions.description = "Do things with Google";
    this.deployOptions.options = [{
      name: "search",
      description: "Normal Google search",
      type: 1,
      options: [{
        name: "query",
        description: "Search term",
        type: 3,
        required: true
      }]
    },
    {
      name: "images",
      description: "Google Images search",
      type: 1,
      options: [{
        name: "query",
        description: "Search term",
        type: 3,
        required: true
      }]
    }, {
      name: "translate",
      description: "Translate text with Google Translate",
      type: 1,
      options: [{
        name: "text",
        description: "Text to translate",
        type: 3,
        required: true
      }, {
        name: "lang",
        description: "Choose the language to which the text will be translated (English by default)",
        autocomplete: true,
        type: 3,
        required: false
      }]
    }, {
      name: "tts",
      description: "Text-to-speech",
      type: 1,
      options: [{
        name: "text",
        description: "Text to say with TTS",
        type: 3,
        required: true
      }, {
        name: "lang",
        description: "Choose the language in which the text will be spoken (English by default)",
        autocomplete: true,
        type: 3,
        required: false
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
        if (bot.badwords.isProfane(tosearch) && !interaction.channel.nsfw) return await interaction.reply("To order this content go to an NSFW channel.");

        const results = await googleIt({ 'query': tosearch, 'limit': 7, disableConsole: true });

        if (!results.length) return await interaction.reply("I didn't find anything");
        if (results.some(e => checkCleanUrl(e.link)) && !interaction.channel.nsfw) return await interaction.reply("Your search includes NSFW content. To order this content go to an NSFW channel.");
        if (results.some(e => (bot.badwords.isProfane(e.title.toLowerCase()) || bot.badwords.isProfane(e.snippet.toLowerCase()))) && !interaction.channel.nsfw) return await interaction.reply("Your search includes NSFW content. To order this content go to an NSFW channel.");

        let text = '';
        let i = 0;
        for (const elements of Object.values(results)) {
          i++
          const toadd = `${i}. [${elements.title}](${elements.link})\n${elements.snippet}\n\n`;
          if ((text.length + toadd.length) > 2040) break;
          text += toadd;
        }
        const embed = new EmbedBuilder()
          .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({}) })
          .setColor('Random')
          .setTitle('Google Search Results')
          .setDescription(text)
          .setFooter({ text: 'Powered by Google-it' })
          .addFields([{ name: 'Time', value: ((Date.now() - interaction.createdTimestamp) / 1000) + 's', inline: true }])
          .setTimestamp();
        const but_link_google = new ButtonBuilder()
          .setStyle("Link")
          .setURL(`https://www.google.com/search?q=${tosearch.split(" ").join("+")}`)
          .setLabel("Google search link");

        await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents([but_link_google])] });
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
        if (!results.length) return await interaction.reply("I didn't find anything.");

        const urls = results.map(e => e.url);
        let i = 0;
        const max = urls.length - 1;
        const embed = new EmbedBuilder()
          .setTitle("Image search: " + interaction.options.getString("query"))
          .setDescription(`Use the buttons to move from one image to another`)
          .setFooter({ text: `${i + 1}/${max + 1}` })
          .setImage(urls[i])
          .setColor("Random");

        const but_back = new ButtonBuilder()
          .setCustomId("image_c_back")
          .setStyle("Secondary")
          .setLabel("Back")
          .setDisabled(true);

        const but_stop = new ButtonBuilder()
          .setCustomId("image_c_stop")
          .setStyle("Danger")
          .setLabel("Stop");

        const but_next = new ButtonBuilder()
          .setCustomId("image_c_next")
          .setStyle("Secondary")
          .setLabel("Next");

        const filter = (button) => {
          if (button.user.id !== interaction.user.id) button.reply({ content: "Use your own instance by using `/image <query>`", ephemeral: true });
          return button.user.id === interaction.user.id;
        };
        const msg = await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents([but_back, but_stop, but_next])], fetchReply: true });

        const collector = msg.createMessageComponentCollector({ filter, idle: 30000 });
        collector.on('collect', async (button) => {
          if (button.customId === 'image_c_next') {
            if (max !== i) {
              i++
              embed.setImage(urls[i])
              embed.setFooter({ text: `${i + 1}/${max + 1}` })
              await button.update({ embeds: [embed], components: [new ActionRowBuilder().addComponents(((max === i ? [but_back.setDisabled(false), but_stop, but_next.setDisabled(true)] : [but_back.setDisabled(false), but_stop, but_next.setDisabled(false)])))] });
            }
          }
          if (button.customId === 'image_c_back') {
            if (i !== 0) {
              i--
              embed.setImage(urls[i])
              embed.setFooter({ text: `${i + 1}/${max + 1}` })
              await button.update({ embeds: [embed], components: [new ActionRowBuilder().addComponents(((i === 0 ? [but_back.setDisabled(true), but_stop, but_next.setDisabled(false)] : [but_back.setDisabled(false), but_stop, but_next.setDisabled(false)])))] });
            }
          }
          if (button.customId === 'image_c_stop') collector.stop("stoped")
        })
        collector.on('end', (c, r) => {
          if (r === "stoped") c.last().update({ embeds: [embed], components: [new ActionRowBuilder().addComponents([but_back.setDisabled(true), but_stop.setDisabled(true), but_next.setDisabled(true)])] })
          else if (r !== "messageDelete") interaction.editReply({ embeds: [embed], components: [new ActionRowBuilder().addComponents([but_back.setDisabled(true), but_stop.setDisabled(true), but_next.setDisabled(true)])] }).catch(() => { });
        });
      }
        break;
      case 'translate': {
        const lang = interaction.options.getString('lang', false) || "en";

        const reallang = languages.getCode(lang);
        if (!reallang) return await interaction.reply({ content: "Invalid language!\nhttps://github.com/AidanWelch/google-translate-api/blob/master/languages.js", ephemeral: true });

        const text = interaction.options.getString("text");
        if (text.length > 5000) return await interaction.reply({ content: "That text is too long!", ephemeral: true });
        const result = await gtranslate(text, { to: reallang });
        if (result.from.text.didYouMean) await interaction.reply({ embeds: [new EmbedBuilder().setColor("Random").setTitle("Did you mean?").setDescription(splitMessage(result.from.text, { maxLength: 4096, char: "", append: "..." })[0])] })
        await interaction.reply({
          embeds: [new EmbedBuilder()
            .setTitle("Translate")
            .setDescription(`\`\`\`css\n${splitMessage(result.text, { maxLength: 4000, char: "", append: "..." })[0]}\`\`\``)
            .setColor("Random")
            .addFields([{ name: 'Lang', value: `\`\`\`css\n${reallang}\`\`\`` }])
            .setFooter({ text: `Translation output${result.from.text.autoCorrected ? " (autocorrected)" : " "}` })
            .setTimestamp()]
        });
      }
        break;
      case 'tts': {
        const lang = interaction.options.getString('lang', false) || "en";
        const reallang = languages.getCode(lang);
        if (!reallang) return await interaction.reply({ content: "Invalid language!\nhttps://github.com/AidanWelch/google-translate-api/blob/master/languages.js", ephemeral: true });
        const tosay = interaction.options.getString("text");
        if (tosay.length > 200) return await interaction.reply({ content: "Must be less than 200 characters", ephemeral: true });
        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply({ files: [new AttachmentBuilder(`https://translate.google.com/translate_tts?ie=UTF-8&total=1&idx=0&textlen=64&client=tw-ob&q=${encodeURIComponent(tosay)}&tl=${encodeURIComponent(reallang)}`, { name: "tts.mp3" })], ephemeral: true });
      }
        break;
    }
  }
}