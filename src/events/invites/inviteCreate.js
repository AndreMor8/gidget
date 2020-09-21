export default async (bot, invite) => {
    if(invite.guild.me.hasPermission("MANAGE_GUILD")) {
        invite.guild.inviteCount = await invite.guild.getInviteCount();
    }
}