import { Collection, Formatters, MessageActionRow, MessageButton, MessageEmbed, Util } from 'discord.js';
import getPremiumType from '../../utils/detectnitro.js';
const svc_timer = new Set();

export default class extends SlashCommand {
	constructor(options) {
		super(options)
		this.deployOptions.description = "Get info on stuff on Discord";
		this.deployOptions.options = [
			{
				name: "server",
				description: "Get server information",
				type: "SUB_COMMAND",
				options: [{
					name: "server-id",
					description: "ID of the server to check",
					type: "STRING",
					required: false
				}]
			},
			{
				name: "server-channels",
				description: "Get all channels from the current server",
				type: "SUB_COMMAND",
				options: [{
					name: "member",
					description: "Limit structure to the channels a member can see...",
					type: "USER",
					required: false,
				},
				{
					name: "role",
					description: "Limit structure to the channels a role can see...",
					type: "ROLE",
					required: false
				}]
			},
			{
				name: "channel",
				description: "Get channel information",
				type: "SUB_COMMAND",
				options: [{
					name: "channel",
					description: "The channel to check",
					type: "CHANNEL",
					required: false
				}]
			},
			{
				name: "channel-overrides",
				description: "Get permission overrides for a channel",
				type: "SUB_COMMAND",
				options: [{
					name: "channel",
					description: "The channel to check",
					type: "CHANNEL",
					required: false
				}]
			},
			{
				name: "role",
				description: "Get role information",
				type: "SUB_COMMAND",
				options: [{
					name: "role",
					description: "Role to check",
					type: "ROLE",
					required: false
				}]
			},
			{
				name: "user",
				description: "Get user information",
				type: "SUB_COMMAND",
				options: [{
					name: "user",
					description: "The user to check",
					type: "USER",
					required: false
				}]
			},
			{
				name: "widget",
				description: "Get server widget information",
				type: "SUB_COMMAND",
				options: [{
					name: "server-id",
					description: "ID of the server to check",
					type: "STRING",
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
			case 'server': {
				if ((!interaction.guild) && (!interaction.options.getString("server-id"))) interaction.reply("Server ID is required when using the command in DMs");
				const wanted = interaction.options.getString("server-id", false);
				let server = wanted ? await bot.guilds.fetch(wanted).catch(() => { }) : interaction.guild;
				if (!server) server = await bot.fetchGuildPreview(wanted).catch(() => { });
				if (!server) return await interaction.reply({ content: "Invalid ID!\nSearch by ID only works whether the bot is on that server or if it is a discoverable server", ephemeral: true });
				const servericon = server.iconURL({ dynamic: true, size: 4096 });
				//¯\_(ツ)_/¯
				const links = [`[Guild](https://discord.com/channels/${server.id})`];
				if (servericon) links.push(`[Server icon](${servericon})`);
				let embedenabled;
				let embedchannel;
				let catname = "";
				let invitenum = "";
				let bannumber = "";
				let roles;
				let mroles;
				let rroles;
				let ae;
				let emojis;
				let allEmojis;
				/*
				let bots;
				let rmembers;
				let online;
				let idle;
				let dnd;
				let offline;
				let active;
				*/
				const channels = await server.channels?.fetch(undefined, { cache: false });
				if (server.me) {
					const cat = channels.filter(c => c.type === "GUILD_CATEGORY").size;
					if (cat == 1) catname += "1 category";
					else catname += cat + " categories";

					const embeddata = await server.fetchWidget().catch(() => { });
					if (embeddata) {
						embedenabled = embeddata.enabled;
						embedchannel = embeddata.channel;
					} else {
						embedenabled = server.embedEnabled || server.widgetEnabled
						embedchannel = server.embedChannel || server.widgetChannel
					}

					if ((interaction.guildId === "402555684849451028") && (server.id === "402555684849451028")) {
						const bans = await server.bans.fetch();

						if (bans.first()) bannumber = bans.size.toString() + " bans";
						else bannumber = "Without bans";

						const invites = await server.invites.fetch();

						if (invites.first()) invitenum = invites.size.toString() + " invites";
						else invitenum = "Without invites";
					}
					if (server.bannerURL()) links.push(`[Banner Image](${server.bannerURL({ format: "png", size: 4096 })})`);
					if (embedenabled) links.push(`[Widget](https://discord.com/widget?id=${server.id}), [Widget Image](https://discord.com/api/v${bot.options.http.version}/guilds/${server.id}/widget.png)`);
					const vanity = await server.fetchVanityData().catch(() => { });
					if (vanity && vanity.code) {
						links.push("[Vanity invite URL" + (vanity.uses ? (" (" + vanity.uses + " uses)") : "") + "](https://discord.gg/" + (vanity.code) + ")");
					} else if (server.vanityURLCode) {
						const vanity = {
							uses: server.vanityURLUses,
							code: server.vanityURLCode
						};
						links.push("[Vanity invite URL" + (vanity.uses ? (" (" + vanity.uses + " uses)") : "") + "](https://discord.gg/" + (vanity.code) + ")");
					}

					allEmojis = await interaction.guild.emojis.fetch();
					ae = allEmojis.filter(e => e.animated === true).size;
					emojis = allEmojis.size - ae;
					roles = server.roles.cache.size;
					mroles = server.roles.cache.filter(r => r.managed === true).size;
					rroles = roles - mroles;
					/*
					bots = server.members.cache.filter(m => m.user.bot === true)
						.size;
		
					rmembers = server.memberCount - bots;
		
					online = server.members.cache.filter(
						m => m.user.presence.status === "online"
					).size;
		
					idle = server.members.cache.filter(
						m => m.user.presence.status === "idle"
					).size;
		
					dnd = server.members.cache.filter(
						m => m.user.presence.status === "dnd"
					).size;
		
					offline = server.members.cache.filter(
						m => m.user.presence.status === "offline"
					).size;
		
					active = online + idle + dnd;
					*/
				}

				if (server.splashURL()) links.push(`[Invite Splash Image](${server.splashURL({ format: "png", size: 4096 })})`);

				if (server.discoverySplashURL()) links.push("[Discovery Splash image](" + server.discoverySplashURL({ format: "png", size: 4096 }) + ")");

				const embed = new MessageEmbed()
					.setTitle("Server info")
					.setAuthor({ name: server.name, iconURL: servericon })
					.addField("Name", `${server.name} ${(server.nameAcronym) ? (" (" + server.nameAcronym + ")") : ""}`, true)
					.addField("ID", server.id, true)
				if (server.description) embed.addField("Description", server.description, true);
				if (server.me) {
					const owner = await server.fetchOwner();
					embed.addField("Server Owner", owner.user.tag + "\n" + owner.toString(), true)
						.addField("Server Create Date", bot.botIntl.format(server.createdAt), true)
						.addField("Verification Level", server.verificationLevel, true)
						.addField("Default Message Notifications", server.defaultMessageNotifications, true)
						.addField("Partnered?", server.partnered ? "**Yes**" : "No", true)
						.addField("Verified?", server.verified ? "**Yes**" : "No", true)
					if (server.rulesChannel) embed.addField("Rules channel", server.rulesChannel.toString(), true);
					if (server.publicUpdatesChannel) embed.addField("Discord private updates", server.publicUpdatesChannel.toString(), true);
					embed.addField("Member Count", server.memberCount?.toString() || "?", true)
						.addField("Channel Count", `${channels.filter(c => c.isText() || c.isVoice()).size} (${catname})\nText-based = ${channels.filter(c => c.isText()).size}\nVoice-based = ${channels.filter(c => c.isVoice()).size}`, true)
						.addField("Emojis", `${allEmojis.size.toString()}\nNormal = ${emojis}\nAnimated = ${ae}`, true)
						.addField("Roles", `${roles}\nNormal = ${rroles}\nManaged = ${mroles}`, true)
						.addField("Server Boost Level", server.premiumTier.toString(), true)
						.addField("Boosts", server.premiumSubscriptionCount.toString(), true)
					if (server.systemChannel) embed.addField("System Channel", server.systemChannel.toString(), true);
					embed.addField("Widget Enabled?", embedenabled ? "Yes" + (embedchannel ? ", in " + embedchannel.toString() : "") : "No", true)
        /*.addField("Presence Count (" + active + " active on this server)", `**Online:** ${online}\n**Idle**: ${idle}\n**Do Not Disturb:** ${dnd}\n**Offline:** ${offline}`, true)*/;
					if ((interaction.guildId === "402555684849451028") && (server.id === "402555684849451028")) {
						embed.addField("Ban count", bannumber, true)
							.addField("Invite count", invitenum, true);
					}
				}
				embed.addField("Features", server.features.join("\n") || "None", true)
					.setThumbnail((server.banner) ? server.bannerURL({ format: "png", size: 128 }) : server.discoverySplashURL({ format: "png", size: 128 }))
					.setImage(server.splashURL({ format: "png", size: 128 }))
					.setColor("#FF00FF")
					.setTimestamp();
				if (server.maximumMembers) embed.addField("Maximum members", server.maximumMembers.toString(), true);
				embed.addField("Links", links.join(", "));
				if ((interaction.guildId === "402555684849451028") && (server.id === "402555684849451028")) {
					const fetch = (await server.roles.fetch("402559343540568084", { force: true })).members.map(m => m.user);
					const admins = fetch.join("\n");
					embed.addField("Admin List", admins);
				}
				await interaction.reply({ embeds: [embed] });
			}
				break;
			case 'server-channels': {
				if (!interaction.guild) return await interaction.reply("The only channel I can see here is this.");
				if (interaction.user.id !== "577000793094488085") {
					if (!svc_timer.has(interaction.user.id)) {
						svc_timer.add(interaction.user.id);
						setTimeout(() => svc_timer.delete(interaction.user.id), 60000);
					} else {
						return await interaction.reply({ content: "Don't overload this command! (1 min cooldown)", ephemeral: true });
					}
				}
				let text = "";
				const eeee = interaction.options.getMember('member', false) || interaction.options.getRole('role', false);
				const member = (eeee?.members) ? eeee : await eeee?.fetch?.({ cache: true });
				let col = await interaction.guild.channels.fetch();
				await interaction.guild.channels.fetchActiveThreads();
				if (member) col = col.filter(c => c.type === "GUILD_CATEGORY" ? (c.children.some(r => r.permissionsFor(member.id).has("VIEW_CHANNEL")) || (c.permissionsFor(member.id).has("MANAGE_CHANNELS"))) : (c.permissionsFor(member.id).has("VIEW_CHANNEL")));
				const wocat = Util.discordSort(col.filter(c => !c.parent && c.type !== "GUILD_CATEGORY"));
				const textnp = wocat.filter(c => c.isText() || c.type === "GUILD_STORE");
				const voicenp = wocat.filter(c => c.isVoice());
				if (wocat.size >= 1) {
					text += textnp.map(advancedmap).join("\n");
					text += voicenp.map(advancedmap).join("\n");
				}
				const voiceChannels = col.filter(c => c.isVoice());
				const user = Collection.prototype.concat.apply(new Collection(), voiceChannels.map(e => e.members)).filter(e => !interaction.guild.members.cache.has(e.id)).map(e => e.id);
				if (user.length) await interaction.guild.members.fetch({ user });

				const cats = Util.discordSort(col.filter(c => c.type === "GUILD_CATEGORY"));
				cats.each(c => {
					const children = c.children.intersect(col);
					const textp = children.filter(c => ['GUILD_TEXT', 'GUILD_STORE', 'GUILD_NEWS'].includes(c.type));
					const voicep = children.filter(c => c.isVoice());
					text += "\n[📂] " + c.name;
					text += textp.size ? ("\n\t" + Util.discordSort(textp).map(advancedmap).join("\n\t")) : "";
					text += voicep.size ? ("\n\t" + Util.discordSort(voicep).map(advancedmap).join("\n\t")) : "";
				});
				const split = Util.splitMessage(text);
				for (const i in split) {
					if (interaction.replied) await interaction.followUp(Formatters.codeBlock("Channel structure of " + interaction.guild.name + (member ? (" for " + (member.user ? member.user.tag : member.name)) : "") + "\n" + split[i]));
					else await interaction.reply(Formatters.codeBlock("Channel structure of " + interaction.guild.name + (member ? (" for " + (member.user ? member.user.tag : member.name)) : "") + "\n" + split[i]));
				}
			}
				break;
			case 'channel': {
				if (!interaction.guild) return await interaction.reply("Yes, I know this is a channel, but there are no interesting things I can show you.");
				const obj = {
					GUILD_TEXT: "Text channel",
					GUILD_VOICE: "Voice channel",
					GUILD_CATEGORY: "Category channel",
					GUILD_NEWS: "News channel",
					GUILD_STORE: "Store channel",
					GUILD_STAGE_VOICE: "Stage channel",
					GUILD_NEWS_THREAD: "Thread channel from news channel",
					GUILD_PUBLIC_THREAD: "Public thread channel",
					GUILD_PRIVATE_THREAD: "Private thread channel",
					UNKNOWN: "Guild channel"
				};
				const obj2 = {
					60: "1 hour",
					1440: "1 day",
					4320: "3 days",
					10080: "1 week"
				}
				const channel = interaction.options.getChannel('channel', false) || interaction.channel;
				const embed = new MessageEmbed()
					.setTitle("Channel information for " + channel.name)
					.setColor("RANDOM")
					.setTimestamp()
					.addField("ID", channel.id, true)
					.addField("Type", obj[channel.type], true)
					.addField("Client things", (!channel.isThread() ? "Can I see it?: " + (channel.viewable ? "Yes" : "No") : "") + ("\nCan I manage it?: " + (channel.manageable ? "Yes" : "No")) + (channel.type === "GUILD_VOICE" ? (("\nCan I join it?: " + (channel.joinable ? "Yes" : "No")) + ("\nCan I speak in it?: " + ((channel.speakable) ? "Yes" : "No"))) : "") + (channel.isThread() ? ("\nCan I join it?: " + (channel.joinable ? "Yes" : "No")) + ("\nCan I edit it?: " + (channel.editable ? "Yes" : "No")) + ("\nCan I send messages on it?: " + (channel.sendable ? "Yes" : "No")) + ("\nCan I unarchive it?: " + (channel.unarchivable ? "Yes" : "No")) : ""), true)
					.addField("Created At", bot.botIntl.format(channel.createdAt), true);
				if (channel.parentId) {
					embed.addField("Parent", `<#${channel.parentId}>\n\`${channel.parentId}\``, true);
					if (!channel.isThread()) embed.addField("Synchronized with the channel's parent?", channel.permissionsLocked ? "Yes" : "No", true);
				}
				if (!channel.isThread()) embed.addField("Position", channel.parent ? ("General: " + channel.position.toString() + "\nRaw: " + channel.rawPosition.toString()) : channel.position.toString(), true);
				switch (channel.type) {
					case 'GUILD_NEWS':
					case 'GUILD_TEXT':
						embed.addField("Pinned messages", channel.permissionsFor(bot.user.id).has("VIEW_CHANNEL") ? (await channel.messages.fetchPinned(false).catch(() => { return { size: "*Without permissions for see that*" } })).size.toString() : "*Without permissions for see that*", true)
							.addField("Last pin at", channel.lastPinAt ? bot.botIntl.format(channel.lastPinAt) : "*None*", true)
							.addField("NSFW?", channel.nsfw ? "Yes" : "No", true);
						if (channel.type !== "GUILD_NEWS") {
							embed.addField("Slowmode", channel.rateLimitPerUser + " seconds", true);
						}
						embed.addField("Threads on this channel", channel.threads.cache.size.toString(), true)
						embed.addField("Topic", channel.topic || "*None*");
						break;
					case 'GUILD_STAGE_VOICE':
					case 'GUILD_VOICE':
						embed.addField("Bitrate", channel.bitrate + " bps", true)
							.addField("Joined members", channel.members.size.toString(), true)
							.addField("User limit", channel.userLimit ? channel.userLimit.toString() : "*None*", true)
							.addField("Full?", channel.full ? "Yes" : "No", true);
						if (channel.type === "GUILD_STAGE_VOICE" && channel.instance) {
							embed.addField("Instance ID", channel.instance.id, true)
								.addField("Instance created at", bot.botIntl.format(channel.instance.createdAt), true)
								.addField("Discovery disabled?", channel.instance.discoverableDisabled ? "Yes" : "No", true)
								.addField("Privacy level", channel.instance.privacyLevel, true)
								.addField("Topic", channel.instance.topic || "*None*");
						}
						break;
					case 'GUILD_CATEGORY':
						embed.addField("Channels in this category", channel.children.size.toString(), true);
						break;
					case 'GUILD_NEWS_THREAD':
					case 'GUILD_PUBLIC_THREAD':
					case 'GUILD_PRIVATE_THREAD':
						embed
							.addField("Thread creator", `<@!${channel.ownerId}> (${channel.ownerId})`, true)
							.addField("Archived?", channel.archived ? `Yes, since ${bot.botIntl.format(channel.archivedAt)}` : "No", true)
							.addField("It will autoarchive in", `${obj2[channel.autoArchiveDuration]}`, true)
							.addField("Thread members", channel.memberCount >= 50 ? `+50 (${channel.members.cache.size}) cached` : channel.memberCount.toString(), true)
							.addField("Locked?", channel.locked ? "Yes" : "No", true)
							.addField("Slowmode", channel.rateLimitPerUser + " seconds", true)
							.addField("\u200b", "\u200b", true)
							.addField("Pinned messages", channel.permissionsFor(bot.user.id).has("VIEW_CHANNEL") ? (await channel.messages.fetchPinned(false)).size.toString() : "*Without permissions for see that*", true)
							.addField("Last pin at", channel.lastPinAt ? bot.botIntl.format(channel.lastPinAt) : "*None*", true)
				}
				const but_link_msg = new MessageButton()
					.setStyle("LINK")
					.setURL(`https://discordapp.com/channels/${interaction.guild.id}/${channel.id}/${channel.lastMessageId}`)
					.setLabel("Last channel message")
					.setDisabled(channel.lastMessageId ? false : true);
				await interaction.reply({ embeds: [embed], components: channel.isText() ? [new MessageActionRow().addComponents([but_link_msg])] : undefined });
			}
				break;
			case "channel-overrides": {
				if (!interaction.guild) return await interaction.reply("This sub-command only works on servers.");
				const channel = interaction.options.getChannel('channel', false) || await interaction.guild.channels.fetch(interaction.channelId);
				if (channel.guild.id !== interaction.guildId) return await interaction.reply({ content: "The channel you have put belongs to another server.", ephemeral: true });
				const rr = channel.permissionOverwrites.cache.filter(m => m.type === "member" && !interaction.guild.members.cache.has(m.id)).map(m => m.id)
				if (rr.length) await interaction.guild.members.fetch({ user: rr });
				const permissions = await Promise.all(channel.permissionOverwrites.cache.map(async m => {
					let text = ``;
					if (m.type === "member") {
						if (bot.users.cache.get(m.id)) {
							if (bot.users.cache.get(m.id).bot) text += `[🤖] ${bot.users.cache.get(m.id).tag}:\n`;
							else text += `[🙎] ${bot.users.cache.get(m.id).tag}:\n`;
						} else {
							const n = await interaction.guild.members.fetch(m.id)
							if (n.user.bot) text += `[🤖] ${n.user.tag}:\n`;
							else text += `[🙎] ${n.user.tag}:\n`;
						}
					}
					else text += `[👪] ${interaction.guild.roles.cache.get(m.id).name}:\n`;
					let doit = false;
					if (m.allow.bitfield !== 0) {
						doit = true;
						text += `\t✅ => ${m.allow.toArray().join(", ")}`
					}
					if (m.deny.bitfield !== 0) {
						if (doit) text += `\n\t❌ => ${m.deny.toArray().join(", ")}`
						else text += `\t❌ => ${m.deny.toArray().join(", ")}`

					}
					return text;
				}));
				if (!permissions[0]) return await interaction.reply({ content: "There are no channel overrides here.", ephemeral: true })
				else {
					const contents = Util.splitMessage(`\`\`\`${permissions.join("\n\n")}\n${channel.permissionsLocked ? "The channel is synchronized with its parent category." : "The channel is not synchronized with its parent category."}\nChannel overrides for #${channel.name}\`\`\``, { maxLength: 2000 });
					for (const content of contents) {
						if (interaction.replied) interaction.followUp(content);
						else interaction.reply(content);
					}
				}
			}
				break;
			case 'role': {
				if (!interaction.guild) return await interaction.reply('This sub-command only works on servers.');
				const msg = async (role) => {
					const mng = {
						true: 'Yes',
						false: 'No'
					}
					const mb = {
						true: 'Anyone',
						false: 'Mention Everyone perm'
					}
					/*
					const fullmembers = role.members.size;
					const bots = role.members.filter(m => m.user.bot).size;
					const members = fullmembers - bots;
					let mtext = '';
					let htxt = '';
					let btxt = '';
		
					if (bots == 1) {
						btxt += ' bot';
					} else {
						btxt += ' bots';
					}
					if (members == 1) {
						htxt += ' human';
					} else {
						htxt += ' humans'
					}
		
					if (bots == 0) {
						mtext += members + htxt;
					} else if (members == 0) {
						mtext += bots + btxt;
					} else {
						mtext += fullmembers + '\nHumans: ' + members + '\nBots: ' + bots;
					}
					*/
					const perms = role.permissions.toArray();
					let permstext = "";
					if (perms.indexOf('ADMINISTRATOR') === -1) permstext = perms.join(', ') || "Without permissions.";
					else permstext = 'ADMINISTRATOR (This role has all the permissions)';

					const perms2 = role.permissionsIn(interaction.channel).toArray();
					let permstext2 = "";
					if (perms2.indexOf("ADMINISTRATOR") === -1) permstext2 = perms2.join(", ") || "Without permissions.";
					else permstext2 = "ADMINISTRATOR (This role has all the permissions)";

					const embed = new MessageEmbed()
						.setColor(role.hexColor)
						.setTitle('Information about ' + role.name)
						.addField('ID', role.id, true)
						.addField('Created At', bot.botIntl.format(role.createdAt), true)
						.addField('Mention', role.toString() + ' `' + role.toString() + '`', true)
						.addField('Managed?', mng[role.managed], true)
						.addField('Hoisted?', mng[role.hoist], true)
						/*.addField('Members ', mtext, true)*/
						.addField('Mentionable by', mb[role.mentionable], true)
						.addField('Color', 'Base 10: ' + role.color + '\nHex: ' + role.hexColor, true)
						.addField('Position', `Role Manager: ${role.position}\nAPI: ${role.rawPosition}`, true)
						.addField('Permissions', '`' + permstext + '`')
						.addField('Permissions (Overwrites)', '`' + permstext2 + '`')
						.addField('Does it belong to a bot?', role.tags?.botId ? `**Yes** (${role.tags?.botId}, <@!${role.tags?.botId}>)` : "No", true)
						.addField('Does it belong to a integration?', role.tags?.integrationId ? `**Yes** (${role.tags?.integrationId})` : "No", true)
						.addField('Is this the role for boosters?', role.tags?.premiumSubscriberRole ? "**Yes**" : "No", true)
						.setTimestamp()
					await interaction.reply({ embeds: [embed] });
				}
				const role = interaction.options.getRole('role', false) || interaction.member.roles.highest;
				await msg(role);
			}
				break;
			case 'user': {
				/*
		const status = {
			online: "Online",
			idle: "Idle",
			dnd: "Do Not Disturb",
			offline: "Offline/Invisible"
		};
		const desktop = {
			online: "Desktop => Online",
			idle: "Desktop => Idle",
			dnd: "Desktop => Do Not Disturb"
		};
		const web = {
			online: "Web => Online",
			idle: "Web => Idle",
			dnd: "Web => Do Not Disturb"
		};
		const mobile = {
			online: "Mobile => Online",
			idle: "Mobile => Idle",
			dnd: "Mobile => Do Not Disturb"
		};
		const ptype = {
			PLAYING: "Playing ",
			LISTENING: "Listening ",
			WATCHING: "Watching ",
			STREAMING: "Streaming ",
			CUSTOM_STATUS: "Custom status:"
		};
		*/
				const user = interaction.options.getUser('user', false) || interaction.user;
				const premiumtext = ["Without Nitro", "Nitro Classic", "***Nitro***"];
				const thing = !user.bot ? (await getPremiumType(user)) : undefined;
				let finaltext = "";
				if (!user.bot) {
					if (thing.value < 0) finaltext = "[*I don't know*](https://gidget.andremor.dev/api/auth/)";
					else if (thing.type === "db") finaltext = premiumtext[thing.value] + " (DB)";
					else finaltext = premiumtext[thing.value];
				}
				/*
				const status2 = "";
				if (user.presence.clientStatus) {
					if (user.presence.clientStatus["web"]) {
						status2 += web[user.presence.clientStatus["web"]] + "\n";
					}
					if (user.presence.clientStatus["mobile"]) {
						status2 += mobile[user.presence.clientStatus["mobile"]] + "\n";
					}
					if (user.presence.clientStatus["desktop"]) {
						status2 += desktop[user.presence.clientStatus["desktop"]] + "\n";
					}
				} else {
					status2 = status[user.presence.status];
				}
				if (!status2)
					status2 = "Offline/Invisible";
				var ptext = "";
				if (user.presence.activities && user.presence.activities[0]) {
					for (const npresence of Object.values(user.presence.activities)) {
						if (npresence.type == "CUSTOM_STATUS") {
							ptext += ptype[npresence.type] + "\n";
							if (npresence.emoji)
								ptext += npresence.emoji.toString() + " ";
							if (npresence.state)
								ptext += npresence.state;
							ptext += "\n";
						} else {
							ptext += ptype[npresence.type] + npresence.name;
							if (npresence.details) {
								ptext += "\nDetails: " + npresence.details;
							}
							if (npresence.state) {
								ptext += "\n" + npresence.state;
							}
							if (npresence.party) {
								if (npresence.party.size)
									ptext +=
										"\nParty: " +
										npresence.party.size[0] +
										"/" +
										npresence.party.size[1];
							}
							if (npresence.assets) {
								if (npresence.assets.largeText)
									ptext += "\n" + npresence.assets.largeText;
								if (npresence.assets.smallText)
									ptext += "\n" + npresence.assets.smallText;
							}
							ptext += "\n";
						}
					}
				} else
					ptext = "None";
				*/
				let flagtext = "Without flags";

				if (user.flags) {
					if (user.flags.toArray()) {
						if (user.flags.toArray().join("\n")) {
							flagtext = user.flags.toArray().join("\n");
						}
					}
				}

				const embed = new MessageEmbed()
					.setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ dynamic: true }) })
					.setThumbnail(user.displayAvatarURL({ dynamic: true }))
					.setTitle(`Information about ${user.username}`)
					.setColor("#00ff00")
					.setTimestamp();

				if (interaction.guild) {
					try {
						const member = interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id, { cache: true });

						const perms = member.permissions.toArray();
						let permstext = "";
						if (perms.indexOf("ADMINISTRATOR") === -1) {
							permstext = perms.join(", ") || "Without permissions.";
						} else {
							permstext = "ADMINISTRATOR (All permissions)";
						}
						const perms2 = member.permissionsIn(interaction.channelId).toArray();
						let permstext2 = "";
						if (perms2.indexOf("ADMINISTRATOR") === -1) {
							permstext2 = perms2.join(", ") || "Without permissions.";
						} else {
							permstext2 = "ADMINISTRATOR (All permissions)";
						}

						embed.addField("Full Username", user.tag + "\n" + user.toString(), true)
							.addField("ID", user.id, true)
							.addField("Nickname", member.nickname ? `${member.nickname}` : "None", true)
							.addField("Bot?", user.bot ? "Yes" : "No", true);
						if (!user.bot) embed.addField("Nitro type", finaltext, true);
						embed
							/*.addField("Status", status2, true)
								.addField("Presence", ptext, true)*/
							.addField("Flags", `\`${flagtext}\``, true)
							.addField("Permissions (General)", `\`${permstext}\``, true)
							.addField("Permissions (Overwrites)", `\`${permstext2}\``, true)
							.addField("Still being verified?", member.pending ? "**Yes**" : "No")
						/*.addField("Last Message", user.lastMessage ? user.lastMessage.url : "Without fetch about that");*/
						if (!user.bot) embed.addField("Boosting?", member.premiumSince ? `Yes, since ${bot.botIntl.format(member.premiumSince)}` : "No");
						embed.addField(`Joined ${interaction.guild.name} at`, bot.botIntl.format(member.joinedAt))
							.addField("Joined Discord At", bot.botIntl.format(user.createdAt))
							.addField("Roles", `${member.roles.cache.filter(r => r.id !== interaction.guild.id).map(roles => `${roles}`).join(" **|** ") || "No Roles"}`);
						await interaction.reply({ embeds: [embed], ephemeral: true });
					} catch (err) {
						embed.addField("Full Username", user.tag + "\n" + user.toString(), true)
							.addField("ID", user.id, true)
							.addField("Bot?", user.bot ? "Yes" : "No", true);
						if (!user.bot) embed.addField("Nitro type", finaltext, true);
						embed
							/*.addField("Status", status2, true)
								.addField("Presence", Discord.Util.splitMessage(ptext, { maxLength: 1000 })[0], true)*/
							.addField("Flags", `\`${flagtext}\``, true)
							/*.addField(
								"Last Message",
								user.lastMessage ? user.lastMessage.url : "Without fetch about that"
							)*/
							.addField("Joined Discord At", bot.botIntl.format(user.createdAt));
						await interaction.reply({ embeds: [embed], ephemeral: true });
					}
				} else {
					embed.addField("Full Username", user.tag + "\n" + user.toString(), true)
						.addField("ID", user.id, true)
						.addField("Bot?", user.bot ? "Yes" : "No", true);
					if (!user.bot) embed.addField("Nitro type", finaltext, true);
					embed
						/*.addField("Status", status2, true)
							.addField("Presence", ptext, true)*/
						.addField("Flags", `\`${flagtext}\``, true)
						/*.addField(
							"Last Message",
							user.lastMessage ? user.lastMessage.url : "Without fetch about that"
						)*/
						.addField("Joined Discord At", bot.botIntl.format(user.createdAt));
					await interaction.reply({ embeds: [embed], ephemeral: true });
				}
			}
				break;
			case 'widget': {
				if ((!interaction.guild) && (!interaction.options.getString("server-id"))) interaction.reply("Server ID is required when using the command in DMs");
				const res = await fetch(`https://discord.com/api/v${bot.options.http.version}/guilds/${interaction.options.getString("server-id", false) || interaction.guildId}/widget.json`);
				const json = await res.json();
				if (!res.ok) return await interaction.reply({ content: "Error: " + json.message, ephemeral: true });
				const embed = new MessageEmbed()
					.setTitle(`Widget information for ${json.name}`)
					.addField("Enabled instant invite?", (json.instant_invite ? `[Yes](${json.instant_invite})` : "No") || "?")
					.addField("Voice channels", json.channels.length > 0 ? Util.splitMessage(json.channels.sort((b, a) => b.position - a.position).map(e => `${e.name} (${e.id})`).join("\n"), { maxLength: 1024 })[0] : "No channels")
					.addField("Member Count", (json.members.length > 99) ? "100 or more" : json.members.length.toString())
					.addField("Presence Count", json.presence_count.toString())
					.addField("Links", `[Widget JSON](https://discord.com/api/v${bot.options.http.version}/guilds/${json.id}/widget.json) - [Widget](https://discord.com/widget?id=${json.id}&theme=dark) - [Widget Image](https://discord.com/api/v${bot.options.http.version}/guilds/${json.id}/widget.png)`);
				await interaction.reply({ embeds: [embed] });
			}
				break;
		}
	}
}

function advancedmap(c) {
	let r = "";
	switch (c.type) {
		case "GUILD_NEWS":
			r += "[📢] " + c.name + (c.threads.cache.size ? c.threads.cache.map(d => {
				return "\n\t" + (c.parentId ? "\t" : "") + "[🧵] " + d.name;
			}).join("") : "");
			break;
		case "GUILD_TEXT":
			r += "[📃] " + c.name + (c.threads.cache.size ? c.threads.cache.map(d => {
				return "\n\t" + (c.parentId ? "\t" : "") + "[🧵] " + d.name;
			}).join("") : "");
			break;
		case "GUILD_VOICE":
			r += "[🎙] " + c.name + (c.members.size.toString() ? (c.members.map(d => {
				if (d.user.bot) {
					return "\n\t" + (c.parentId ? "\t" : "") + "[🤖] " + d.user.tag;
				} else {
					return "\n\t" + (c.parentId ? "\t" : "") + "[🙎] " + d.user.tag;
				}
			})).join("") : "")
			break;
		case "GUILD_STAGE_VOICE":
			r += "[👪] " + c.name + (c.members.size.toString() ? (c.members.map(d => {
				if (d.user.bot) {
					return "\n\t" + (c.parentId ? "\t" : "") + "[🤖] " + d.user.tag;
				} else {
					return "\n\t" + (c.parentId ? "\t" : "") + "[🙎] " + d.user.tag;
				}
			})).join("") : "")
			break;
		case "GUILD_STORE":
			r += "[🏪] " + c.name;
			break;
		default:
			r += "[?] " + c.name;
			break;
	}
	return r;
}