import { getWelcome, setWelcome } from "../../extensions.js";
export default async (bot, oldMember, newMember) => {
    if (oldMember) {
        if (oldMember.pending && !newMember.pending) {
            const welcome = await getWelcome(newMember.guild);
            if (welcome.respectms) {
                const { inviterMention, inviterTag, inviterId } = bot.savedInvites.get(newMember.id) || { inviterMention: "Unknown", inviterTag: "Unknown", inviterId: "Unknown" };
                if (welcome.enabled && (welcome.channelID && welcome.text)) {
                    const channel = await newMember.guild.channels.fetch(welcome.channelID).catch(() => { });
                    if (channel && channel.isText() && channel.permissionsFor(bot.user.id).has(["VIEW_CHANNEL", "SEND_MESSAGES"])) {
                        const finalText = welcome.text.replace(/%MEMBER%/gmi, newMember.toString()).replace(/%MEMBERTAG%/, newMember.user.tag).replace(/%MEMBERID%/, newMember.id).replace(/%SERVER%/gmi, newMember.guild.name).replace(/%INVITER%/gmi, inviterMention).replace(/%INVITERTAG%/gmi, inviterTag).replace(/%INVITERID%/gmi, inviterId).replace(/%MEMBERCOUNT%/, newMember.guild.memberCount);
                        await channel.send(finalText || "?", { allowedMentions: { users: [newMember.id] } }).catch(() => { });
                    } else await setWelcome(newMember.guild, 1, null);
                }
                if (welcome.dmenabled && welcome.dmtext) {
                    const finalText = welcome.dmtext.replace(/%MEMBER%/gmi, newMember.toString()).replace(/%MEMBERTAG%/, newMember.user.tag).replace(/%MEMBERID%/, newMember.id).replace(/%SERVER%/gmi, newMember.guild.name).replace(/%INVITER%/gmi, inviterMention).replace(/%INVITERTAG%/gmi, inviterTag).replace(/%INVITERID%/gmi, inviterId).replace(/%MEMBERCOUNT%/, newMember.guild.memberCount);
                    await newMember.send(finalText || "?").catch(() => { });
                }
                if (welcome.roleID) {
                    const role = await newMember.guild.roles.fetch(welcome.roleID).catch(() => { });
                    if (role && role.editable) {
                        await newMember.roles.add(role, "Welcome system").catch(() => { });
                    } else await setWelcome(newMember.guild, 8, null);
                }
            }
        }
    }
};