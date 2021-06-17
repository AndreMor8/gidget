export default async (bot, invite) => {
    if(invite.guild.me.permissions.has("MANAGE_GUILD")) {
        invite.guild.inviteCount = await invite.guild.getInviteCount();
    }
}