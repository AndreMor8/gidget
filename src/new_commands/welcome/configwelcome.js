import { getWelcome, setWelcome, getInviteCount, splitMessage } from '../../extensions.js';
import Discord from 'discord.js';

export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.permissions = {
      user: [32n, 0n],
      bot: [0n, 0n]
    };
    this.guildonly = true;
    this.deployOptions.description = "Welcome and goodbye system";
    this.deployOptions.options = [{
      name: "get",
      description: "Get welcome configuration",
      type: 1
    },
    {
      name: "toggle",
      description: "Enable welcome (channel or role) system",
      type: 1
    },
    {
      name: "channel",
      description: "Assign a welcome channel where a message will be sent",
      type: 1,
      options: [{
        name: "channel",
        description: "The channel where the welcome message will be sent",
        type: 7,
        required: false
      }]
    },
    {
      name: "message",
      description: "Assign the welcome message",
      type: 1,
      options: [{
        name: "message",
        description: "The welcome message",
        type: 3,
        required: true
      }]
    },
    {
      name: "role",
      description: "Assign the role that will be given to new members",
      type: 1,
      options: [{
        name: "role",
        description: "The welcoming role",
        type: 8,
        required: false
      }]
    },
    {
      name: "respectms",
      description: "Determine if you want member screening to be respected before giving the role",
      type: 1
    },
    {
      name: "dmtoggle",
      description: "Enable DM welcome message",
      type: 1
    },
    {
      name: "dmmessage",
      description: "Assign the DM welcome message",
      type: 1,
      options: [{
        name: "message",
        description: "The DM welcome message",
        type: 3,
        required: true
      }]
    },
    {
      name: "leavetoggle",
      description: "Enable goodbye/farewell message",
      type: 1
    },
    {
      name: "leavechannel",
      description: "Assign a goodbye channel where a message will be sent",
      type: 1,
      options: [{
        name: "channel",
        description: "The channel where the goodbye message will be sent",
        type: 7,
        required: false
      }]
    },
    {
      name: "leavemessage",
      description: "Assign the goodbye message",
      type: 1,
      options: [{
        name: "message",
        description: "The goodbye message",
        type: 3,
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
        const embed = new Discord.EmbedBuilder()
          .setTitle("Welcome info")
          .setDescription("Variables documented here: https://docs.gidget.andremor.dev/features/members/welcome-system")
          .addFields([
            { name: "Welcome enabled? (enable)", value: doc.enabled ? "Yes" : "No" },
            { name: "Channel for welcomes (channel)", value: doc.channelID ? ("<#" + doc.channelID + ">") : "Not assigned" },
            { name: "Welcome message (message)", value: splitMessage(doc.text, { maxLength: 1000 })[0]},
            { name: "Welcome role (role)", value: doc.roleID ? ("<@&" + doc.roleID + ">") : "Not assigned" },
            { name: "Respect member screening? (respectms)", value: doc.respectms ? "Yes" : "No" },
            { name: "DM welcome enabled? (dmenable)", value: doc.dmenabled ? "Yes" : "No" },
            { name: "DM message (dmmessage)", value: splitMessage(doc.dmtext, { maxLength: 1000 })[0] },
            { name: "Goodbye enabled? (leaveenable)", value: doc.leaveenabled ? "Yes" : "No" },
            { name: "Channel for goodbyes (leavechannel)", value: doc.leavechannelID ? ("<#" + doc.leavechannelID + ">") : "Not assigned" },
            { name: "Goodbye message (leavemessage)", value: splitMessage(doc.leavetext, { maxLength: 1000 })[0] }
          ])
        await interaction.reply({ embeds: [embed] });
      }
        break;
      case "toggle": {
        const reference = !!doc.enabled;
        if (!reference) {
          if (!doc.channelID && !doc.roleID) return await interaction.reply("There is no assigned channel or role. Set it before starting the welcome system.");
          if (doc.channelID) {
            const channel = await interaction.guild.channels.fetch(doc.channelID).catch(() => { });
            if (!channel) return await interaction.reply("The assigned channel doesn't exist.");
            if (!channel.permissionsFor(bot.user.id).has(["ViewChannel", "SendMessages"]))
              return await interaction.reply("Give me permissions for send messages on the assigned channel before starting the welcome system.");
          }
          if (doc.roleID) {
            const role = await interaction.guild.roles.fetch(doc.roleID).catch(() => { });
            if (!role) return await interaction.reply("The assigned role doesn't exist.");
            if (!role.editable) return await interaction.reply("I don't have permissions to give the assigned role.\nMake sure I have the `ManageRoles` permission, and that this assigned role is below my highest role.")
          }
        }
        await setWelcome(interaction.guild, 0, !reference);
        await interaction.reply("The welcome system has been " + (!reference ? "enabled.\nReview the settings to respect member screening, if you are interested." : "disabled."));
      }
        break;
      case "channel": {
        const channel = interaction.options.getChannel("channel");
        if (!channel) {
          if (doc.enabled && !doc.roleID) return await interaction.reply("The channel is not optional if the system is **enabled** and **no role** is assigned.");
          await setWelcome(interaction.guild, 1, null);
          await interaction.reply("Channel unassigned successfully.");
          break;
        }
        if (!channel.isTextBased()) return await interaction.reply("That isn't a text-based channel");
        if (!channel.permissionsFor(bot.user.id).has(["ViewChannel", "SendMessages"])) return await interaction.reply("I don't have permissions for send messages in that channel");
        await setWelcome(interaction.guild, 1, channel.id);
        await interaction.reply("Channel set correctly");
      }
        break;
      case "message": {
        const text = interaction.options.getString("message", true);
        if (text.length > 2000) return await interaction.reply("Your message must be less than 2000 characters long.");
        if (/%INVITER%/gmi.test(text)) {
          if (!interaction.guild.members.me.permissions.has("ManageGuild"))
            return await interaction.reply("You must give me the permission to manage guild if you want the who invited the user to appear.");
        }
        await setWelcome(interaction.guild, 2, text);
        await interaction.reply("Welcome message set correctly");
      }
        break;
      case "role": {
        const role = interaction.options.getRole("role");
        if (!role) {
          if (doc.enabled && !doc.channelID) return await interaction.reply("The role is not optional if the system is **enabled** and **no channel** is assigned.");
          await setWelcome(interaction.guild, 8, null);
          await interaction.reply("Channel unassigned successfully.");
          break;
        }
        if (!role.editable) return await interaction.reply("I don't have permissions to give this role.\nMake sure I have the `ManageRoles` permission, and that this role is below my highest role.")
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
        if (text.length > 2000) return await interaction.reply("Your message must be less than 2000 characters long.");
        if (/%INVITER%/gmi.test(text)) {
          if (!interaction.guild.members.me.permissions.has("ManageGuild"))
            return await interaction.reply("You must give me the permission to manage guild if you want the who invited the user to appear.");
        }
        await setWelcome(interaction.guild, 4, text);
        await interaction.reply("DM message set correctly");
      }
        break;
      case "leavetoggle": {
        const reference = !!doc.leaveenabled;
        if (!reference) {
          if (!doc.leavechannelID) return await interaction.reply("There is no assigned channel. Set it before starting the goodbye system.");
          const channel = await interaction.guild.channels.fetch(doc.leavechannelID).catch(() => { });
          if (!channel) return await interaction.reply("The assigned channel doesn't exist.");
          if (!channel.permissionsFor(bot.user.id).has(["ViewChannel", "SendMessages"]))
            return await interaction.reply("Give me permissions for send messages on the assigned channel before starting the goodbye system.");
        }
        await setWelcome(interaction.guild, 5, !reference);
        await interaction.reply("The goodbye system has been " + (!reference ? "enabled." : "disabled."));
      }
        break;
      case "leavechannel": {
        const channel = interaction.options.getChannel("channel");
        if (!channel) {
          if (doc.leaveenabled) return await interaction.reply("The channel is not optional if the system is enabled.");
          await setWelcome(interaction.guild, 6, null);
          await interaction.reply("Channel unassigned successfully.");
          break;
        }
        if (!channel.isTextBased()) return await interaction.reply("That isn't a text-based channel");
        if (!channel.permissionsFor(bot.user.id).has(["ViewChannel", "SendMessages"]))
          return await interaction.reply("I don't have permissions for send messages in that channel");
        await setWelcome(interaction.guild, 6, channel.id);
        await interaction.reply("Channel set correctly");
      }
        break;
      case "leavemessage": {
        const text = interaction.options.getString("message", true);
        if (text.length > 2000) return await interaction.reply("Your message must be less than 2000 characters long.");
        await setWelcome(interaction.guild, 7, text);
        await interaction.reply("Goodbye message set correctly");
      }
        break;
    }
    if (interaction.guild.members.me.permissions.has("ManageGuild"))
      interaction.guild.inviteCount = await getInviteCount(interaction.guild).catch(() => { return {}; });
  }
}