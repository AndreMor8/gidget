import { getInviteCount } from "../../extensions.js";
export default async (bot, invite) => {
  if (invite.guild.members.me.permissions.has("ManageGuild")) {
    invite.guild.inviteCount = await getInviteCount(invite.guild);
  }
}