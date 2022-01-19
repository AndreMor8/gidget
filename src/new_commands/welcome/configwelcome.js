import { getWelcome, setWelcome, getInviteCount } from '../../extensions.js';
import Discord from 'discord.js';
export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.aliases = ["welcome"];
    this.permissions = {
      user: [32n, 0n],
      bot: [0n, 0n]
    };
    this.guildonly = true;
    this.deployOptions.description = "Welcome and goodbye system";
    this.deployOptions.options = [{
      name: "get",
      description: "Get welcome configuration",
      type: "SUB_COMMAND"
    },
    {
      name: "toggle",
      description: "Enable normal welcome message",
      type: "SUB_COMMAND"
    },
    {
      name: "channel",
      description: "Assign a welcome channel where a message will be sent",
      type: "SUB_COMMAND",
      options: [{
        name: "channel",
        description: "The channel where the welcome message will be sent",
        type: "CHANNEL",
        required: false
      }]
    },
    {
      name: "message",
      description: "Assign the welcome message",
      type: "SUB_COMMAND",
      options: [{
        name: "message",
        description: "The welcome message",
        type: "STRING",
        required: true
      }]
    },
    {
      name: "role",
      description: "Assign the role that will be given to new members",
      type: "SUB_COMMAND",
      options: [{
        name: "role",
        description: "The welcoming role",
        type: "ROLE",
        required: false
      }]
    },
    {
      name: "respectms",
      description: "Determine if you want member screening to be respected before giving the role",
      type: "SUB_COMMAND"
    },
    {
      name: "dmtoggle",
      description: "Enable DM welcome message",
      type: "SUB_COMMAND"
    },
    {
      name: "dmmessage",
      description: "Assign the DM welcome message",
      type: "SUB_COMMAND",
      options: [{
        name: "message",
        description: "The DM welcome message",
        type: "STRING",
        required: true
      }]
    },
    {
      name: "leavetoggle",
      description: "Enable goodbye/farewell message",
      type: "SUB_COMMAND"
    },
    {
      name: "leavechannel",
      description: "Assign a goodbye channel where a message will be sent",
      type: "SUB_COMMAND",
      options: [{
        name: "channel",
        description: "The channel where the goodbye message will be sent",
        type: "CHANNEL",
        required: false
      }]
    },
    {
      name: "leavemessage",
      description: "Assign the goodbye message",
      type: "SUB_COMMAND",
      options: [{
        name: "message",
        description: "The goodbye message",
        type: "STRING",
        required: true
      }]
    }
    ]
  }
  async run(bot, interaction) {
    const doc = await getWelcome(interaction.guild);
    const option = interaction.options.getSubcommand();
    switch (option) {
      case "get": {
        const embed = new Discord.MessageEmbed()
          .setTitle("Welcome info")
          .setDescription("Variables documented here: https://docs.gidget.andremor.dev/features/members/welcome-system")
          .addField("Welcome enabled? (enable)", doc.enabled ? "Yes" : "No")
          .addField("Channel for welcomes (channel)", doc.channelID ? ("<#" + doc.channelID + ">") : "Not assigned")
          .addField("Welcome message (message)", Discord.Util.splitMessage(doc.text, { maxLength: 1000 })[0])
          .addField("Welcome role (role)", doc.roleID ? ("<@&" + doc.roleID + ">") : "Not assigned")
          .addField("Respect member screening? (respectms)", doc.respectms ? "Yes" : "No")
          .addField("DM welcome enabled? (dmenable)", doc.dmenabled ? "Yes" : "No")
          .addField("DM message (dmmessage)", Discord.Util.splitMessage(doc.dmtext, { maxLength: 1000 })[0])
          .addField("Goodbye enabled? (leaveenable)", doc.leaveenabled ? "Yes" : "No")
          .addField("Channel for goodbyes (leavechannel)", doc.leavechannelID ? ("<#" + doc.leavechannelID + ">") : "Not assigned")
          .addField("Goodbye message (leavemessage)", Discord.Util.splitMessage(doc.leavetext, { maxLength: 1000 })[0]);
        interaction.reply({ embeds: [embed] });
      }
        break;
      case "toggle": {
        const reference = !!doc.enabled;
        if (!reference) {
          if (!doc.channelID && !doc.roleID) return interaction.reply("There is no assigned channel or role. Set it before starting the welcome system.");
          if (doc.channelID) {
            const channel = await interaction.guild.channels.fetch(doc.channelID).catch(() => { });
            if (!channel) return interaction.reply("The assigned channel doesn't exist.");
            if (!channel.permissionsFor(bot.user.id).has(["VIEW_CHANNEL", "SEND_MESSAGES"]))
              return interaction.reply("Give me permissions for send messages on the assigned channel before starting the welcome system.");
          }
          if (doc.roleID) {
            const role = await interaction.guild.roles.fetch(doc.roleID).catch(() => { });
            if (!role) return interaction.reply("The assigned role doesn't exist.");
            if (!role.editable) return interaction.reply("I don't have permissions to give the assigned role.\nMake sure I have the `MANAGE_ROLES` permission, and that this assigned role is below my highest role.")
          }
        }
        await setWelcome(interaction.guild, 0, !reference);
        await interaction.reply("The welcome system has been " + (!reference ? "enabled.\nReview the settings to respect member screening, if you are interested." : "disabled."));
      }
        break;
      case "channel": {
        if (!args[2]) return interaction.reply("You have not put a channel");
        const channel = interaction.options.getChannel("channel");
        if (!channel) {
          if (doc.enabled && !doc.roleID) return interaction.reply("The channel is not optional if the system is **enabled** and **no role** is assigned.");
          await setWelcome(interaction.guild, 1, null);
          await interaction.reply("Channel unassigned successfully.");
          break;
        }
        if (!channel.isText()) return interaction.reply("That isn't a text-based channel");
        if (!channel.permissionsFor(bot.user.id).has(["VIEW_CHANNEL", "SEND_MESSAGES"])) return interaction.reply("I don't have permissions for send messages in that channel");
        await setWelcome(interaction.guild, 1, channel.id);
        await interaction.reply("Channel set correctly");
      }
        break;
      case "message": {
        const text = interaction.options.getString("message", true);
        if (text.length < 2000) interaction.reply("Your message must be less than 2000 characters long.");
        if (/%INVITER%/gmi.test(text)) {
          if (!interaction.guild.me.permissions.has("MANAGE_GUILD"))
            return interaction.reply("You must give me the permission to manage guild if you want the who invited the user to appear.");
        }
        await setWelcome(interaction.guild, 2, text);
        await interaction.reply("Welcome message set correctly");
      }
        break;
      case "role": {
        const role = interaction.options.getRole("role");
        if (!role) {
          if (doc.enabled && !doc.channelID) return interaction.reply("The role is not optional if the system is **enabled** and **no channel** is assigned.");
          await setWelcome(interaction.guild, 8, null);
          await interaction.reply("Channel unassigned successfully.");
          break;
        }
        if (!role.editable) return interaction.reply("I don't have permissions to give this role.\nMake sure I have the `MANAGE_ROLES` permission, and that this role is below my highest role.")
        await setWelcome(interaction.guild, 8, role.id);
        await interaction.reply("Role set correctly");
      }
        break;
      case "respectms": {
        const reference = !!doc.respectms;
        await setWelcome(interaction.guild, 9, !reference);
        await interaction.reply(!reference ? "Now I will respect the member screening: I will execute the welcome system if the user is verified.\nDisabling member screening and having this enabled makes the system useless" : "I will execute the welcome system to the member regardless of whether it was verified in the screening\n(at this point having it enabled (member screening) is useless)");
      }
        break;
      case "dmtoggle": {
        const reference = !!doc.dmenabled;
        await setWelcome(interaction.guild, 3, !reference);
        await interaction.reply("The DM welcome system has been " + (!reference ? "Enabled" : "Disabled"));
      }
        break;
      case "dmmessage": {
        const text = interaction.options.getString("message", true);
        if (text.length < 2000) interaction.reply("Your message must be less than 2000 characters long.");
        if (/%INVITER%/gmi.test(args.slice(2).join(" "))) {
          if (!interaction.guild.me.permissions.has("MANAGE_GUILD"))
            return interaction.reply("You must give me the permission to manage guild if you want the who invited the user to appear.");
        }
        await setWelcome(interaction.guild, 4, args.slice(2).join(" "));
        await interaction.reply("DM message set correctly");
      }
        break;
      case "leavetoggle": {
        const reference = !!doc.leaveenabled;
        if (!reference) {
          if (!doc.leavechannelID) return interaction.reply("There is no assigned channel. Set it before starting the goodbye system.");
          const channel = await interaction.guild.channels.fetch(doc.leavechannelID).catch(() => { });
          if (!channel) return interaction.reply("The assigned channel doesn't exist.");
          if (!channel.permissionsFor(bot.user.id).has(["VIEW_CHANNEL", "SEND_MESSAGES"]))
            return interaction.reply("Give me permissions for send messages on the assigned channel before starting the goodbye system.");
        }
        await setWelcome(interaction.guild, 5, !reference);
        await interaction.reply("The goodbye system has been " + (!reference ? "enabled." : "disabled."));
      }
        break;
      case "leavechannel": {
        const channel = interaction.options.getChannel("channel");
        if (!channel) {
          if (doc.leaveenabled) return interaction.reply("The channel is not optional if the system is enabled.");
          await setWelcome(interaction.guild, 6, null);
          await interaction.reply("Channel unassigned successfully.");
          break;
        }
        if (!channel.isText()) return interaction.reply("That isn't a text-based channel");
        if (!channel.permissionsFor(bot.user.id).has(["VIEW_CHANNEL", "SEND_MESSAGES"]))
          return interaction.reply("I don't have permissions for send messages in that channel");
        await setWelcome(interaction.guild, 6, channel.id);
        await interaction.reply("Channel set correctly");
      }
        break;
      case "leavemessage": {
        const text = interaction.options.getString("message", true);
        if (text.length < 2000) interaction.reply("Your message must be less than 2000 characters long.");
        await setWelcome(interaction.guild, 7, text);
        await interaction.reply("Goodbye message set correctly");
      }
        break;
    }
    if (interaction.guild.me.permissions.has("MANAGE_GUILD"))
      interaction.guild.inviteCount = await getInviteCount(interaction.guild).catch(() => { return {}; });
  }
}