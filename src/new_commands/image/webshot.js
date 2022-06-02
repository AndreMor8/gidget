import Discord from "discord.js";
const timer = new Set();

export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Take a screenshot of a web page";
    this.deployOptions.options = [{
      name: "site",
      type: "STRING",
      description: "The web page you want to screenshot",
      required: true
    }, {
      name: "y",
      description: "Where on the page to go vertically",
      type: "NUMBER",
      required: false
    }, {
      name: "x",
      description: "Where on the page to go horizontally",
      type: "NUMBER",
      required: false
    }];
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 32768n]
    }
  }
  async run(bot, interaction) {
    if (interaction.user.id !== "577000793094488085") {
      if (!timer.has(interaction.user.id)) {
        timer.add(interaction.user.id);
        setTimeout(() => timer.delete(interaction.user.id), 30000);
      } else {
        return interaction.reply({ content: "Don't overload this command! (30 sec cooldown)", ephemeral: true });
      }
    }
    const site = interaction.options.getString("site", true);
    const options = {
      y: parseInt(interaction.options.getNumber("y", false)) || 0,
      x: parseInt(interaction.options.getNumber("x", false)) || 0
    };
    await pup(interaction, site.startsWith("http://") || site.startsWith("https://") ? site : `http://${site}`, options);
  }
}

/**
 * @param interaction {Discord.CommandInteraction}
 * @param url {string}
 * @param options {object}
 */
async function pup(interaction, url, options) {
  await interaction.deferReply();
  try {
    // eslint-disable-next-line no-undef
    const res = await fetch(process.env.PUPPETEER_API, {
      method: "POST",
      headers: {
        "auth-token": process.env.PUPPETEER_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url, x: options?.x, y: options?.y, nsfw: interaction.channel?.nsfw || false })
    });
    if (!res.ok) throw new Error(await res.text() || (res.status));
    else {
      const att = new Discord.MessageAttachment(Buffer.from(await res.arrayBuffer()), "capture.png");
      const time = "Time: " + (Date.now() - (interaction.createdTimestamp)) / 1000 + "s";
      await interaction.editReply({ content: time, files: [att] });
    }
  } catch (err) {
    interaction.editReply(err.toString());
  }
}
