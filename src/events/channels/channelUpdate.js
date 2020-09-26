export default async function(bot, oldChannel, newChannel) {
    if(newChannel.id === "663909563929722880") {
        const everyoneperms = newChannel.permissionOverwrites.get(newChannel.guild.id);
        const oldperms = oldChannel.permissionOverwrites.get(oldChannel.guild.id);
        if(everyoneperms && oldperms) {
            if(everyoneperms.deny.equals(oldperms.deny) && everyoneperms.allow.equals(oldperms.allow)) return;
            if(!everyoneperms.deny.has("SEND_MESSAGES") || everyoneperms.allow.has("SEND_MESSAGES")) {
                if(newChannel.name !== "wubbzy_wednesday-🟢") await newChannel.setName("wubbzy_wednesday-🟢");
            } else if(everyoneperms.deny.has("SEND_MESSAGES")) {
                if(newChannel.name !== "wubbzy_wednesday-🔴") await newChannel.setName("wubbzy_wednesday-🔴");
            }
        }
    }
}