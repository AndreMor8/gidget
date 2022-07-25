import { Collection, Formatters, ActionRowBuilder, ButtonBuilder, EmbedBuilder, discordSort } from 'discord.js';
import getPremiumType from '../../utils/detectnitro.js';

import { splitMessage } from '../../extensions.js';
const svc_timer = new Set();

export default class extends SlashCommand {
	constructor(options) {
		super(options)
		this.deployOptions.description = "Get info on stuff on Discord";
		this.deployOptions.options = [
			{
				name: "server",
				description: "Get server information",
				type: 1,
				options: [{
					name: "server-id",
					description: "ID of the server to check",
					type: 3,
					required: false
				}]
			},
			{
				name: "server-channels",
				description: "Get all channels from the current server",
				type: 1,
				options: [{
					name: "member",
					description: "Limit structure to the channels a member can see...",
					type: 6,
					required: false,
				},
				{
					name: "role",
					description: "Limit structure to the channels a role can see...",
					type: 8,
					required: false
				}]
			},
			{
				name: "channel",
				description: "Get channel information",
				type: 1,
				options: [{
					name: "channel",
					description: "The channel to check",
					type: 7,
					required: false
				}]
			},
			{
				name: "channel-overrides",
				description: "Get permission overrides for a channel",
				type: 1,
				options: [{
					name: "channel",
					description: "The channel to check",
					type: 7,
					required: false
				}]
			},
			{
				name: "role",
				description: "Get role information",
				type: 1,
				options: [{
					name: "role",
					description: "Role to check",
					type: 8,
					required: false
				}]
			},
			{
				name: "user",
				description: "Get user information",
				type: 1,
				options: [{
					name: "user",
					description: "The user to check",
					type: 6,
					required: false
				}]
			},
			{
				name: "widget",
				description: "Get server widget information",
				type: 1,
				options: [{
					name: "server-id",
					description: "ID of the server to check",
					type: 3,
					required: false
				}]
			},
			{
				name: "invite",
				description: "Get information about a server invite",
				type: 1,
				options: [{
					name: "code",
					description: "Invite URL or code",
					type: 3,
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
			case 'server': {
				if ((!interaction.guild) && (!interaction.options.getString("server-id"))) interaction.reply("Server ID is required when using the command in DMs");
				const wanted = interaction.options.getString("server-id", false);
				let server = wanted ? await bot.guilds.fetch(wanted).catch(() => { }) : interaction.guild;
				if (!server) server = await bot.fetchGuildPreview(wanted).catch(() => { });
				if (!server) return await interaction.reply({ content: "Invalid ID!\nSearch by ID only works whether the bot is on that server or if it is a discoverable server", ephemeral: true });
				const servericon = server.iconURL({ size: 4096 });
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
				if (server.members?.me) {
					const cat = channels.filter(c => c.type === 4).size;
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
					if (server.bannerURL()) links.push(`[Banner Image](${server.bannerURL({ extension: "png", size: 4096 })})`);
					if (embedenabled) links.push(`[Widget](https://discord.com/widget?id=${server.id}), [Widget Image](https://discord.com/api/v${bot.options.ws.version}/guilds/${server.id}/widget.png)`);
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

				if (server.splashURL()) links.push(`[Invite Splash Image](${server.splashURL({ extension: "png", size: 4096 })})`);

				if (server.discoverySplashURL()) links.push("[Discovery Splash image](" + server.discoverySplashURL({ extension: "png", size: 4096 }) + ")");

				const embed = new EmbedBuilder()
					.setTitle("Server info")
					.setAuthor({ name: server.name, iconURL: servericon })
					.addFields([
						{ name: "Name", value: `${server.name} ${(server.nameAcronym) ? (" (" + server.nameAcronym + ")") : ""}`, inline: true },
						{ name: "ID", value: server.id, inline: true }
					])
				if (server.description) embed.addFields([{ name: "Description", value: server.description, inline: true }]);
				if (server.members?.me) {
					const owner = await server.fetchOwner();
					embed.addFields([
						{ name: "Server Owner", value: owner.user.tag + "\n" + owner.toString(), inline: true },
						{ name: "Server Create Date", value: bot.botIntl.format(server.createdAt), inline: true },
						{ name: "Verification Level", value: server.verificationLevel.toString(), inline: true },
						{ name: "Default Message Notifications", value: server.defaultMessageNotifications.toString(), inline: true },
						{ name: "Partnered?", value: server.partnered ? "**Yes**" : "No", inline: true },
						{ name: "Verified?", value: server.verified ? "**Yes**" : "No", inline: true },
					])
					if (server.rulesChannel) embed.addFields([{ name: "Rules channel", value: server.rulesChannel.toString(), inline: true }]);
					if (server.publicUpdatesChannel) embed.addFields([{ name: "Discord private updates", value: server.publicUpdatesChannel.toString(), inline: true }]);
					embed
						.addFields([
							{ name: "Member Count", value: server.memberCount?.toString() || "?", inline: true },
							{ name: "Channel Count", value: `${channels.filter(c => c.isTextBased() || c.isVoiceBased()).size} (${catname})\nText-based = ${channels.filter(c => c.isTextBased()).size}\nVoice-based = ${channels.filter(c => c.isVoiceBased()).size}`, inline: true },
							{ name: "Emojis", value: `${allEmojis.size.toString()}\nNormal = ${emojis}\nAnimated = ${ae}`, inline: true },
							{ name: "Roles", value: `${roles}\nNormal = ${rroles}\nManaged = ${mroles}`, inline: true },
							{ name: "Server Boost Level", value: server.premiumTier.toString(), inline: true },
							{ name: "Boosts", value: server.premiumSubscriptionCount.toString(), inline: true },
						])

					if (server.systemChannel) embed.addFields([{ name: "System Channel", value: server.systemChannel.toString(), inline: true }]);
					embed.addFields([{ name: "Widget Enabled?", value: embedenabled ? "Yes" + (embedchannel ? ", in " + embedchannel.toString() : "") : "No", inline: true }/*, { name: "Presence Count (" + active + " active on this server)", value: `**Online:** ${online}\n**Idle**: ${idle}\n**Do Not Disturb:** ${dnd}\n**Offline:** ${offline}`, inline: true }*/]);
					if ((interaction.guildId === "402555684849451028") && (server.id === "402555684849451028")) {
						embed.addFields([{ name: "Ban count", value: bannumber, inline: true }, { name: "Invite count", value: invitenum, inline: true }]);
					}
				}
				embed.addFields([{ name: "Features", value: server.features.join("\n") || "None", inline: true }])
					.setThumbnail((server.banner) ? server.bannerURL({ extension: "png", size: 128 }) : server.discoverySplashURL({ extension: "png", size: 128 }))
					.setImage(server.splashURL({ extension: "png", size: 128 }))
					.setColor("#FF00FF")
					.setTimestamp();
				if (server.maximumMembers) embed.addFields([{ name: "Maximum members", value: server.maximumMembers.toString(), inline: true }]);
				embed.addFields([{ name: "Links", value: links.join(", ") }]);
				if ((interaction.guildId === "402555684849451028") && (server.id === "402555684849451028")) {
					const fetch = (await server.roles.fetch("402559343540568084", { force: true })).members.map(m => m.user);
					const admins = fetch.join("\n");
					embed.addFields([{ name: "Admin List", value: admins }]);
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
				const eeee = interaction.options.getMember('member') || interaction.options.getRole('role');
				const member = (eeee?.members) ? eeee : await eeee?.fetch?.({ cache: true });
				let col = await interaction.guild.channels.fetch();
				await interaction.guild.channels.fetchActiveThreads();
				if (member) col = col.filter(c => c.type === 4 ? (c.children.cache.some(r => r.permissionsFor(member.id).has("ViewChannel")) || (c.permissionsFor(member.id).has("ManageChannels"))) : (c.permissionsFor(member.id).has("ViewChannel")));
				const wocat = discordSort(col.filter(c => !c.parent && c.type !== 4));
				const textnp = wocat.filter(c => c.isTextBased());
				const voicenp = wocat.filter(c => c.isVoiceBased());
				if (wocat.size >= 1) {
					text += textnp.map(advancedmap).join("\n");
					text += voicenp.map(advancedmap).join("\n");
				}
				const voiceChannels = col.filter(c => c.isVoiceBased());
				const user = Collection.prototype.concat.apply(new Collection(), voiceChannels.map(e => e.members)).filter(e => !interaction.guild.members.cache.has(e.id)).map(e => e.id);
				if (user.length) await interaction.guild.members.fetch({ user });

				const cats = discordSort(col.filter(c => c.type === 4));
				cats.each(c => {
					const children = c.children.cache.intersect(col);
					const textp = children.filter(c => [0, 5].includes(c.type));
					const voicep = children.filter(c => c.isVoiceBased());
					text += "\n[📂] " + c.name;
					text += textp.size ? ("\n\t" + discordSort(textp).map(advancedmap).join("\n\t")) : "";
					text += voicep.size ? ("\n\t" + discordSort(voicep).map(advancedmap).join("\n\t")) : "";
				});
				const split = splitMessage(text);
				for (const i in split) {
					if (interaction.replied) await interaction.followUp(Formatters.codeBlock("Channel structure of " + interaction.guild.name + (member ? (" for " + (member.user ? member.user.tag : member.name)) : "") + "\n" + split[i]));
					else await interaction.reply(Formatters.codeBlock("Channel structure of " + interaction.guild.name + (member ? (" for " + (member.user ? member.user.tag : member.name)) : "") + "\n" + split[i]));
				}
			}
				break;
			case 'channel': {
				if (!interaction.guild) return await interaction.reply("Yes, I know this is a channel, but there are no interesting things I can show you.");
				const obj = {
					'0': "Text channel",
					'2': "Voice channel",
					'4': "Category channel",
					'5': "News channel",
					'10': "Thread channel from news channel",
					'11': "Public thread channel",
					'12': "Private thread channel",
					'13': "Stage channel"
				};
				const obj2 = {
					60: "1 hour",
					1440: "1 day",
					4320: "3 days",
					10080: "1 week"
				}
				const channel = interaction.options.getChannel('channel', false) || interaction.channel;
				const embed = new EmbedBuilder()
					.setTitle("Channel information for " + channel.name)
					.setColor("Random")
					.setTimestamp()
					.addFields([
						{ name: "ID", value: channel.id, inline: true },
						{ name: "Type", value: (obj[channel.type] || "Guild channel"), inline: true },
						{ name: "Client things", value: (!channel.isThread() ? "Can I see it?: " + (channel.viewable ? "Yes" : "No") : "") + ("\nCan I manage it?: " + (channel.manageable ? "Yes" : "No")) + (channel.type === 2 ? (("\nCan I join it?: " + (channel.joinable ? "Yes" : "No")) + ("\nCan I speak in it?: " + ((channel.speakable) ? "Yes" : "No"))) : "") + (channel.isThread() ? ("\nCan I join it?: " + (channel.joinable ? "Yes" : "No")) + ("\nCan I manage it?: " + (channel.manageable ? "Yes" : "No")) + ("\nCan I send messages on it?: " + (channel.sendable ? "Yes" : "No")) + ("\nCan I unarchive it?: " + (channel.unarchivable ? "Yes" : "No")) : ""), inline: true },
						{ name: "Created At", value: bot.botIntl.format(channel.createdAt), inline: true },
					]);
				if (channel.parentId) {
					embed.addFields([{ name: "Parent", value: `<#${channel.parentId}>\n\`${channel.parentId}\``, inline: true }]);
					if (!channel.isThread()) embed.addFields([{ name: "Synchronized with the channel's parent?", value: channel.permissionsLocked ? "Yes" : "No", inline: true }]);
				}
				if (!channel.isThread()) embed.addFields([{ name: "Position", value: channel.parent ? ("General: " + channel.position.toString() + "\nRaw: " + channel.rawPosition.toString()) : channel.position.toString(), inline: true }]);
				switch (channel.type) {
					case 5:
					case 0:
						embed.addFields([
							{ name: "Pinned messages", value: channel.permissionsFor(bot.user.id).has("ViewChannel") ? (await channel.messages.fetchPinned(false).catch(() => { return { size: "*Without permissions for see that*" } })).size.toString() : "*Without permissions for see that*", inline: true },
							{ name: "Last pin at", value: channel.lastPinAt ? bot.botIntl.format(channel.lastPinAt) : "*None*", inline: true },
							{ name: "NSFW?", value: channel.nsfw ? "Yes" : "No", inline: true }
						])
						if (channel.type !== 5) {
							embed.addFields([{ name: "Slowmode", value: channel.rateLimitPerUser + " seconds", inline: true }]);
						}
						embed.addFields([{ name: "Threads on this channel", value: channel.threads.cache.size.toString(), inline: true }, { name: "Topic", value: channel.topic || "*None*" }])
						break;
					case 13:
					case 2:
						embed.addFields([
							{ name: "Bitrate", value: channel.bitrate + " bps", inline: true },
							{ name: "Joined members", value: channel.members.size.toString(), inline: true },
							{ name: "User limit", value: channel.userLimit ? channel.userLimit.toString() : "*None*", inline: true },
							{ name: "Full?", value: channel.full ? "Yes" : "No", inline: true },
						]);

						if (channel.type === 13 && channel.instance) {
							embed.addFields([
								{ name: "Instance ID", value: channel.instance.id, inline: true },
								{ name: "Instance created at", value: bot.botIntl.format(channel.instance.createdAt), inline: true },
								{ name: "Discovery disabled?", value: channel.instance.discoverableDisabled ? "Yes" : "No", inline: true },
								{ name: "Privacy level", value: channel.instance.privacyLevel, inline: true },
								{ name: "Topic", value: channel.instance.topic || "*None*" },
							]);
						}
						break;
					case 4:
						embed.addFields([{ name: "Channels in this category", value: channel.children.cache.size.toString(), inline: true }]);
						break;
					case 10:
					case 11:
					case 12:
						embed.addFields([
							{ name: "Thread creator", value: `<@!${channel.ownerId}> (${channel.ownerId})`, inline: true },
							{ name: "Archived?", value: channel.archived ? `Yes, since ${bot.botIntl.format(channel.archivedAt)}` : "No", inline: true },
							{ name: "It will autoarchive in", value: `${obj2[channel.autoArchiveDuration]}`, inline: true },
							{ name: "Thread members", value: channel.memberCount >= 50 ? `+50 (${channel.members.cache.size}) cached` : channel.memberCount.toString(), inline: true },
							{ name: "Locked?", value: channel.locked ? "Yes" : "No", inline: true },
							{ name: "Slowmode", value: channel.rateLimitPerUser + " seconds", inline: true },
							{ name: "\u200b", value: "\u200b", inline: true },
							{ name: "Pinned messages", value: channel.permissionsFor(bot.user.id).has("ViewChannel") ? (await channel.messages.fetchPinned(false)).size.toString() : "*Without permissions for see that*", inline: true },
							{ name: "Last pin at", value: channel.lastPinAt ? bot.botIntl.format(channel.lastPinAt) : "*None*", inline: true },
						])
				}
				const but_link_msg = new ButtonBuilder()
					.setStyle("Link")
					.setURL(`https://discordapp.com/channels/${interaction.guild.id}/${channel.id}/${channel.lastMessageId}`)
					.setLabel("Last channel message")
					.setDisabled(channel.lastMessageId ? false : true);
				await interaction.reply({ embeds: [embed], components: channel.isTextBased() ? [new ActionRowBuilder().addComponents([but_link_msg])] : undefined });
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
					if (m.type === 1) {
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
					const contents = splitMessage(`\`\`\`${permissions.join("\n\n")}\n${channel.permissionsLocked ? "The channel is synchronized with its parent category." : "The channel is not synchronized with its parent category."}\nChannel overrides for #${channel.name}\`\`\``, { maxLength: 2000 });
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
					if (perms.indexOf('Administrator') === -1) permstext = perms.join(', ') || "Without permissions.";
					else permstext = 'Administrator (This role has all the permissions)';

					const perms2 = role.permissionsIn(interaction.channel).toArray();
					let permstext2 = "";
					if (perms2.indexOf("Administrator") === -1) permstext2 = perms2.join(", ") || "Without permissions.";
					else permstext2 = "Administrator (This role has all the permissions)";

					const embed = new EmbedBuilder()
						.setColor(role.hexColor)
						.setTitle('Information about ' + role.name)
						.addFields([
							{ name: 'ID', value: role.id, inline: true },
							{ name: 'Created At', value: bot.botIntl.format(role.createdAt), inline: true },
							{ name: 'Mention', value: role.toString() + ' `' + role.toString() + '`', inline: true },
							{ name: 'Managed?', value: mng[role.managed], inline: true },
							{ name: 'Hoisted?', value: mng[role.hoist], inline: true },
							/*{ name: 'Members ', value: mtext, inline: true },*/
							{ name: 'Mentionable by', value: mb[role.mentionable], inline: true },
							{ name: 'Color', value: 'Base 10: ' + role.color + '\nHex: ' + role.hexColor, inline: true },
							{ name: 'Position', value: `Role Manager: ${role.position}\nAPI: ${role.rawPosition}`, inline: true },
							{ name: 'Permissions', value: '`' + permstext + '`' },
							{ name: 'Permissions (Overwrites)', value: '`' + permstext2 + '`' },
							{ name: 'Does it belong to a bot?', value: role.tags?.botId ? `**Yes** (${role.tags?.botId}, <@!${role.tags?.botId}>)` : "No", inline: true },
							{ name: 'Does it belong to a integration?', value: role.tags?.integrationId ? `**Yes** (${role.tags?.integrationId})` : "No", inline: true },
							{ name: 'Is this the role for boosters?', value: role.tags?.premiumSubscriberRole ? "**Yes**" : "No", inline: true },
						])
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

				const embed = new EmbedBuilder()
					.setAuthor({ name: user.username, iconURL: user.displayAvatarURL({}) })
					.setThumbnail(user.displayAvatarURL({}))
					.setTitle(`Information about ${user.username}`)
					.setColor("#00ff00")
					.setTimestamp();

				if (interaction.guild) {
					try {
						const member = interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id, { cache: true });

						const perms = member.permissions.toArray();
						let permstext = "";
						if (perms.indexOf("Administrator") === -1) {
							permstext = perms.join(", ") || "Without permissions.";
						} else {
							permstext = "Administrator (All permissions)";
						}
						const perms2 = member.permissionsIn(interaction.channelId).toArray();
						let permstext2 = "";
						if (perms2.indexOf("Administrator") === -1) {
							permstext2 = perms2.join(", ") || "Without permissions.";
						} else {
							permstext2 = "Administrator (All permissions)";
						}

						embed.addFields([
							{ name: "Full Username", value: user.tag + "\n" + user.toString(), inline: true },
							{ name: "ID", value: user.id, inline: true },
							{ name: "Nickname", value: member.nickname ? `${member.nickname}` : "None", inline: true },
							{ name: "Bot?", value: user.bot ? "Yes" : "No", inline: true },
						]);
						if (!user.bot) embed.addFields([{ name: "Nitro type", value: finaltext, inline: true }]);
						embed
							/*.addField("Status", status2, true)
								.addField("Presence", ptext, true)*/
							.addFields([
								{ name: "Flags", value: `\`${flagtext}\``, inline: true },
								{ name: "Permissions (General)", value: `\`${permstext}\``, inline: true },
								{ name: "Permissions (Overwrites)", value: `\`${permstext2}\``, inline: true },
								{ name: "Still being verified?", value: member.pending ? "**Yes**" : "No" },
							]);
						if (!user.bot) embed.addFields([{ name: "Boosting?", value: member.premiumSince ? `Yes, since ${bot.botIntl.format(member.premiumSince)}` : "No" }]);
						embed.addFields([
							{ name: `Joined ${interaction.guild.name} at`, value: bot.botIntl.format(member.joinedAt) },
							{ name: "Joined Discord At", value: bot.botIntl.format(user.createdAt) },
							{ name: "Roles", value: `${member.roles.cache.filter(r => r.id !== interaction.guild.id).map(roles => `${roles}`).join(" **|** ") || "No Roles"}` },
						]);
						await interaction.reply({ embeds: [embed], ephemeral: true });
					} catch (err) {
						embed.addFields([
							{ name: "Full Username", value: user.tag + "\n" + user.toString(), inline: true },
							{ name: "ID", value: user.id, inline: true },
							{ name: "Bot?", value: user.bot ? "Yes" : "No", inline: true },
						]);
						if (!user.bot) embed.addFields([{ name: "Nitro type", value: finaltext, inline: true }]);
						embed
							/*.addField("Status", status2, true)
								.addField("Presence", splitMessage(ptext, { maxLength: 1000 })[0], true)*/
							.addFields([{ name: "Flags", value: `\`${flagtext}\``, inline: true }, { name: "Joined Discord At", value: bot.botIntl.format(user.createdAt) }])
						await interaction.reply({ embeds: [embed], ephemeral: true });
					}
				} else {
					embed.addFields([
						{ name: "Full Username", value: user.tag + "\n" + user.toString(), inline: true },
						{ name: "ID", value: user.id, inline: true },
						{ name: "Bot?", value: user.bot ? "Yes" : "No", inline: true },
					]);
					if (!user.bot) embed.addFields([{ name: "Nitro type", value: finaltext, inline: true }]);
					embed
						/*.addField("Status", status2, true)
							.addField("Presence", splitMessage(ptext, { maxLength: 1000 })[0], true)*/
						.addFields([{ name: "Flags", value: `\`${flagtext}\``, inline: true }, { name: "Joined Discord At", value: bot.botIntl.format(user.createdAt) }])
					await interaction.reply({ embeds: [embed], ephemeral: true });
				}
			}
				break;
			case 'widget': {
				if ((!interaction.guild) && (!interaction.options.getString("server-id"))) interaction.reply("Server ID is required when using the command in DMs");
				const res = await fetch(`https://discord.com/api/v${bot.options.ws.version}/guilds/${interaction.options.getString("server-id", false) || interaction.guildId}/widget.json`);
				const json = await res.json();
				if (!res.ok) return await interaction.reply({ content: "Error: " + json.message, ephemeral: true });
				const embed = new EmbedBuilder()
					.setTitle(`Widget information for ${json.name}`)
					.addFields([
						{ name: "Enabled instant invite?", value: (json.instant_invite ? `[Yes](${json.instant_invite})` : "No") || "?" },
						{ name: "Voice channels", value: json.channels.length > 0 ? splitMessage(json.channels.sort((b, a) => b.position - a.position).map(e => `${e.name} (${e.id})`).join("\n"), { maxLength: 1024 })[0] : "No channels" },
						{ name: "Member Count", value: (json.members.length > 99) ? "100 or more" : json.members.length.toString() },
						{ name: "Presence Count", value: json.presence_count.toString() },
						{ name: "Links", value: `[Widget JSON](https://discord.com/api/v${bot.options.ws.version}/guilds/${json.id}/widget.json) - [Widget](https://discord.com/widget?id=${json.id}&theme=dark) - [Widget Image](https://discord.com/api/v${bot.options.ws.version}/guilds/${json.id}/widget.png)` },
					])
				await interaction.reply({ embeds: [embed] });
			}
				break;
			case 'invite': {
				try {
					const invite = await bot.fetchInvite(interaction.options.getString("code"));
					const embed = new EmbedBuilder()
						.setDescription("The API doesn't give me as much information about a Discord invite")
						.setFooter({ text: `Requested by: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({}) })
						.setColor("Random");
					if (invite.guild) {
						embed.setAuthor({ name: "Invite information", url: invite.guild.iconURL({}) })
							.addFields([
								{ name: "Guild", value: invite.guild.name + "\n`" + invite.guild.id + "`", inline: true },
								{ name: "Guild Verification", value: invite.guild.verificationLevel.toString(), inline: true },
								{ name: "Presence Count", value: invite.presenceCount.toString(), inline: true },
							])
					} else if (invite.channel?.type === 3) {
						embed.setThumbnail(invite.channel?.iconURL())
							.addFields([
								{ name: "Type", value: "Group DM invite", inline: true },
								{ name: "Group name", value: invite.channel?.name ? invite.channel.name : "None", inline: true },
							])
					}
					embed.addFields([{ name: "Member Count", value: invite.memberCount.toString(), inline: true }])
					if (invite.guild) {
						embed.addFields([
							{ name: "Redirects to", value: invite.channel?.name + "\n" + invite.channel?.toString(), inline: true },
							{ name: "\u200b", value: "\u200b", inline: true },
							{ name: "Features", value: invite.guild.features.join("\n") ? invite.guild.features.join("\n") : "Without features", inline: true },
						])
						if (invite.guild.splash) embed.setThumbnail(invite.guild.splashURL({ extension: "png" }))
						if (invite.guild.banner) embed.setImage(invite.guild.bannerURL({ extension: "png" }))
					}
					embed.addFields([{ name: "Inviter", value: invite.inviter ? invite.inviter.tag + "\n" + invite.inviter.toString() : "None", inline: true }])
					await interaction.reply({ embeds: [embed] });
				} catch (err) {
					console.error(err);
					if (err.message === "Unknown Invite") return interaction.reply("The API says that invitation is unknown.");
					else return interaction.reply("Something happened when I was trying to collect the information. Here's a debug: " + err);
				}
			}
		}
	}
}

function advancedmap(c) {
	let r = "";
	switch (c.type) {
		case 5:
			r += "[📢] " + c.name + (c.threads.cache.size ? c.threads.cache.map(d => {
				return "\n\t" + (c.parentId ? "\t" : "") + "[🧵] " + d.name;
			}).join("") : "");
			break;
		case 0:
			r += "[📃] " + c.name + (c.threads.cache.size ? c.threads.cache.map(d => {
				return "\n\t" + (c.parentId ? "\t" : "") + "[🧵] " + d.name;
			}).join("") : "");
			break;
		case 2:
			r += "[🎙] " + c.name + (c.members.size.toString() ? (c.members.map(d => {
				if (d.user.bot) {
					return "\n\t" + (c.parentId ? "\t" : "") + "[🤖] " + d.user.tag;
				} else {
					return "\n\t" + (c.parentId ? "\t" : "") + "[🙎] " + d.user.tag;
				}
			})).join("") : "")
			break;
		case 13:
			r += "[👪] " + c.name + (c.members.size.toString() ? (c.members.map(d => {
				if (d.user.bot) {
					return "\n\t" + (c.parentId ? "\t" : "") + "[🤖] " + d.user.tag;
				} else {
					return "\n\t" + (c.parentId ? "\t" : "") + "[🙎] " + d.user.tag;
				}
			})).join("") : "")
			break;
		default:
			r += "[?] " + c.name;
			break;
	}
	return r;
}