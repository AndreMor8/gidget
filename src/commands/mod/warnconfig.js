export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Configure the warning system.";
        this.permissions = {
            user: [8n, 0n],
            bot: [268435456n, 0n]
        }
    }
    async run(bot, message, args) {
        const system = message.guild.cache.warnsconfig ? message.guild.warnsconfig : await message.guild.getWarnConfig();
        if(!args[1]) message.channel.send(`Warning system for ${message.guild.name}
        
\`Role? (role): ${system.role ? "Yes" : "No"}
${system.role ? `Role time (roletime): ${system.roletime} warnings` : ""}
${system.role ? `Role to use (roleid): ${system.roleid == '0' ? "Not set" : system.roleid}`: ""}

Kick (kick)?: ${system.kick ? "Yes" : "No"}
${system.kick ? `Kick time (kicktime): ${system.kicktime} warnings` : ""}

Ban? (ban): ${system.ban ? "Yes" : "No"}
${system.ban ? `Ban time (bantime): ${system.bantime} warnings` : ""}\`

Usage: \`warnconfig <mode> [<...args>]\`
        `);
        else {
            switch(args[1]) {
                case 'role': {
                    const reference = !!system.role;
                    await message.guild.editWarnConfig(0, !reference);
                    message.channel.send(`Now role config is ${!reference ? "enabled" : "disabled"}`);
                }
                break;
                case 'roletime': {
                    if(!args[2]) message.channel.send("Please put how many warns the member must have before putting a role.");
                    if(args[2].length > 5) return message.channel.send("Too large number!");
                    if(!parseInt(args[2])) return message.channel.send("Invalid number!");
                    await message.guild.editWarnConfig(1, parseInt(args[2]));
                    message.channel.send(`Now role time is setted to ${args[2]}`);
                }
                break;
                case 'roleid': {
                    const role = message.mentions.roles.filter(e => e.guild.id === message.guild.id).first() || message.guild.roles.cache.get(args[2]);
                    if(!role) return message.channel.send("Invalid role!");
                    await message.guild.editWarnConfig(2, role.id);
                    message.channel.send(`Now role ID is setted to ${role.toString()}`);
                }
                break;
                case 'kick': {
                    const reference = !!system.kick;
                    await message.guild.editWarnConfig(3, !reference);
                    message.channel.send(`Now kick config is ${!reference ? "enabled" : "disabled"}`);
                }
                break;
                case 'kicktime': {
                    if(!args[2]) message.channel.send("Please put how many warns the member must have before kicking them.");
                    if(args[2].length > 5) return message.channel.send("Too large number!");
                    if(!parseInt(args[2])) return message.channel.send("Invalid number!");
                    await message.guild.editWarnConfig(4, parseInt(args[2]));
                    message.channel.send(`Now kick time is setted to ${args[2]}`);
                }
                break;
                case 'ban': {
                    const reference = !!system.ban;
                    await message.guild.editWarnConfig(5, !reference);
                    message.channel.send(`Now ban config is ${!reference ? "enabled" : "disabled"}`);
                }
                break;
                case 'bantime': {
                    if(!args[2]) message.channel.send("Please put how many warns the member must have before banning them.");
                    if(args[2].length > 5) return message.channel.send("Too large number!");
                    if(!parseInt(args[2])) return message.channel.send("Invalid number!");
                    await message.guild.editWarnConfig(6, parseInt(args[2]));
                    message.channel.send(`Now ban time is setted to ${args[2]}`);
                }
                break;
                default: {
                    message.channel.send("Invalid mode!");
                }
            }
        }
    }
}