import prefix from "./database/models/prefix.js";
import cr from "./database/models/customresponses.js";
import level from "./database/models/levelconfig.js";
import welcome from "./database/models/welcome.js";
import MessageLinksModel from "./database/models/messagelinks.js";
import autopost from './database/models/autopost.js';
import guildwarnconfig from './database/models/warn.js';
import memberwarns from './database/models/warn2.js';
import { Structures } from 'discord.js';
import confessions from './database/models/confessionconfig.js';

//To differentiate user errors
class StructureError extends Error {
    constructor(error) {
        super();
        this.name = "StructureError";
        this.message = error;
    }
}


/*Structures.extend("TextChannel", TextChannel => {
    return class extends TextChannel {
        constructor(guild, data) {
            super(guild, data);
            this.snipe = null;
            this.snipeTimeout = null;
        }
        deleteSnipe() {
            this.client.clearTimeout(this.snipeInterval);
            this.snipe = null;
        }
        setSnipe(message) {
            this.snipe = message;
            this.snipeTimeout = this.client.setTimeout(() => {
                this.snipe = null;
            }, 300000);
        }
    }
});*/

Structures.extend('Guild', Guild => {
    return class extends Guild {
        constructor(client, data) {
            super(client, data);
            this.queue = null;
            this.musicVariables = null;
            this.prefix = "g%";
            this.welcome = {};
            this.customresponses = {};
            this.levelconfig = {};
            this.messagelinksconfig = {};
            this.inviteCount = {};
            this.connect4 = null;
            this.autopostchannels = [];
            this.warnsconfig = {};
            this.confessionconfig = {};
            this.cache = {
                prefix: false,
                customresponses: false,
                levelconfig: false,
                messagelinksconfig: false,
                welcome: false,
                autopostchannels: false,
                warnsconfig: false,
                confessionconfig: false
            };
        }

        async getConfessionConfig() {
            const doc = await confessions.findOne({ guildID: { $eq: this.id } });
            this.confessionconfig = doc || {};
            this.cache.confessionconfig = true;
            return doc || {};
        }

        async setConfessionAnon() {
            const doc = await confessions.findOne({ guildID: { $eq: this.id } });
            if (!doc) throw new StructureError("First set a channel!");
            doc.anon = !doc.anon;
            await doc.save();
            this.confessionconfig = doc || {};
            this.cache.confessionconfig = true;
            return doc.anon;
        }

        async setConfessionChannel(channel) {
            if (!channel.isText()) throw new StructureError("Only text channels are allowed!");
            let doc = await confessions.findOneAndUpdate({ guildID: { $eq: this.id } }, { $set: { channelID: channel.id } }, { new: true });
            if (!doc) {
                doc = await confessions.create({
                    guildID: this.id,
                    channelID: channel.id
                });
            }
            this.confessionconfig = doc || {};
            this.cache.confessionconfig = true;
            return;
        }

        async deleteConfessionConfig() {
            await confessions.deleteOne({ guildID: { $eq: this.id } });
            this.confessionconfig = {};
            this.cache.confessionconfig = true;
            return;
        }

        async setAutoPostChannel(channel) {
            if (channel.type !== "news") throw new StructureError("Only news channels are allowed!");
            let doc = await autopost.findOneAndUpdate({ guildID: { $eq: this.id } }, { $push: { channels: channel.id } }, { new: true });
            if (!doc) {
                doc = await autopost.create({
                    guildID: this.id,
                    channels: [channel.id]
                });
            }
            this.autopostchannels = doc.channels || [];
            this.cache.autopostchannels = true;
            return;
        }

        async deleteAutoPostChannel(channel) {
            const id = channel?.id || (typeof channel === "string" ? channel : null);
            if (!id) throw new StructureError("Can't get channel ID!");
            if (isNaN(id)) throw new StructureError("Can't get channel ID!");
            const doc = await autopost.findOneAndUpdate({ guildID: { $eq: this.id } }, { $pull: { channels: id } });
            if (!doc) {
                await autopost.create({
                    guildID: this.id,
                    channels: []
                });
            }
            this.autopostchannels = doc.channels || [];
            this.cache.autopostchannels = true;
            if (!doc.channels.includes(id)) throw new StructureError("There is no such channel in the DB.");
            return id;
        }

        async getAutoPostChannels() {
            let doc = await autopost.findOne({ guildID: { $eq: this.id } });
            if (!doc) {
                doc = await autopost.create({
                    guildID: this.id,
                    channels: []
                });
            }
            this.autopostchannels = doc.channels || [];
            this.cache.autopostchannels = true;
            return doc.channels || [];
        }

        async getInviteCount() {
            const col = await this.fetchInvites();
            const invites = Array.from(col.values());
            const inviteCounter = {}

            for (const invite of invites) {
                const id = invite.inviter ? invite.inviter.id : invite.guild.id;
                inviteCounter[id] = (inviteCounter[id] ? parseInt(inviteCounter[id]) : undefined || 0) + (parseInt(invite.uses) || 0);
            }

            return inviteCounter;
        }

        /**
         * @returns {string} The actual guild prefix.
         */
        async getPrefix() {
            const doc = await prefix.findOne({ guildId: { $eq: this.id } });
            if (doc) {
                this.prefix = doc.prefix;
                this.cache.prefix = true;
                return doc.prefix;
            } else {
                this.prefix = "g%";
                this.cache.prefix = true;
                return "g%"
            }
        }
        /**
         * 
         * @param {string} newPrefix - The new server prefix.
         * @returns {string} The new prefix.
         */
        async setPrefix(newPrefix) {
            const doc = await prefix.findOneAndUpdate({ guildId: { $eq: this.id } }, { prefix: newPrefix });
            if (doc) {
                this.prefix = newPrefix;
                this.cache.prefix = true;
                return newPrefix;
            } else {
                await prefix.create({
                    guildId: this.id,
                    prefix: newPrefix,
                });
                this.prefix = newPrefix;
                this.cache.prefix = true;
                return newPrefix;
            }
        }
        /**
         * 
         * @param {string} match - The text string to check in each message.
         * @param {object} message - The Discord.js message object to send.
         * @returns {boolean} Although if there is an error this will just throw it away.
         */
        async addCustomResponse(match, message) {
            const doc = await cr.findOne({ guildId: { $eq: this.id } });
            if (doc) {
                const check = Object.keys(doc.responses).find(e => e === match);
                if (check) throw new StructureError("A key with that match already exists. To avoid data loss problems first remove the key.");
                else {
                    doc.responses[match] = message;
                    await doc.updateOne({ responses: doc.responses });
                    this.customresponses = doc;
                    this.cache.customresponses = true;
                    return true;
                }
            } else {
                const algo = {};
                algo[match] = message;
                const esto = await cr.create({
                    guildId: this.id,
                    responses: algo
                });
                this.customresponses = esto;
                this.cache.customresponses = true;
                return true;
            }
        }
        /**
         * 
         * @param {number} index - Number of index in the object to delete.
         * @returns {boolean} Although if there is an error this will just throw it away.
         */
        async deleteCustomResponse(index) {
            const doc = await cr.findOne({ guildId: { $eq: this.id } });
            if (!cr) {
                this.customresponses = {}
                this.cache.customresponses = true;
                throw new StructureError("There are no custom responses on this server...")
            } else {
                const keys = Object.keys(doc.responses);
                if (!keys.length) throw new StructureError("There are no custom responses on this server...");
                if (index <= keys.length && index >= 1) {
                    const word = keys[index - 1];
                    if (Object.prototype.hasOwnProperty.call(doc.responses, word)) {
                        delete doc.responses[word];
                        const a = Object.keys(doc.responses);
                        if (a.length < 1) {
                            await doc.deleteOne()
                            this.customresponses = {}
                            this.cache.customresponses = true;
                            return true;
                        } else {
                            await doc.updateOne({ responses: doc.responses });
                            this.customresponses = doc;
                            this.cache.customresponses = true;
                            return true;
                        }
                    } else throw new StructureError("Doesn't have their own property? Report this to AndreMor")
                } else throw new StructureError("Invalid ID")
            }
        }
        async getCustomResponses() {
            const doc = await cr.findOne({ guildId: { $eq: this.id } });
            if (doc) {
                this.customresponses = doc;
                this.cache.customresponses = true;
                return doc;
            } else {
                this.customresponses = {};
                this.cache.customresponses = true;
                return {};
            }
        }
        async getLevelConfig() {
            const doc = await level.findOne({ guildId: { $eq: this.id } });
            if (doc) {
                this.levelconfig = doc;
                this.cache.levelconfig = true;
                return doc;
            } else {
                this.levelconfig = {};
                this.cache.levelconfig = true;
                return {};
            }
        }
        /**
         * Changes the level config.
         * 
         * @param {string} config - Config type.
         * @param {boolean} value - New value.
         * @returns {boolean} - If the/a document was created/updated.
         */
        async changeLevelConfig(config, value) {
            if (typeof value !== "boolean") return false;
            const doc = await level.findOne({ guildId: { $eq: this.id } });
            if (doc) {
                if (config === "levelnotif") {
                    doc.levelnotif = value;
                    await doc.save();
                    this.levelconfig = doc;
                    this.cache.levelconfig = true;
                    return true;
                } else if (config === "levelsystem") {
                    doc.levelsystem = value;
                    await doc.save();
                    this.levelconfig = doc;
                    this.cache.levelconfig = true;
                    return true;
                } else return false;
            } else {
                const esto = await level.create({
                    guildId: this.id,
                    levelnotif: config === "levelnotif" ? value : false,
                    levelsystem: config === "levelsystem" ? value : false,
                    roles: []
                });
                this.levelconfig = esto;
                this.cache.levelconfig = true;
                return true;
            }
        }
        /**
         * @returns {object} The document.
         */
        async getMessageLinksConfig() {
            const doc = await MessageLinksModel.findOne({ guildID: { $eq: this.id } });
            if (doc) {
                this.messagelinksconfig = doc;
                this.cache.messagelinksconfig = true;
                return doc;
            } else {
                this.messagelinksconfig = {};
                this.cache.messagelinksconfig = true;
                return {};
            }
        }
        /**
         * 
         * @param {boolean} value - New value for the document.
         * @returns {boolean} Always true.
         */
        async setMessageLinksConfig(value) {
            if (typeof value !== "boolean") throw new Error("'value' isn't a boolean");
            const doc = await MessageLinksModel.findOne({ guildID: { $eq: this.id } });
            if (doc) {
                await doc.updateOne({ enabled: value });
                this.messagelinksconfig = doc;
                this.messagelinksconfig.enabled = value;
                this.cache.messagelinksconfig = true;
                return true;
            } else {
                const newDoc = await MessageLinksModel.create({
                    guildID: this.id,
                    enabled: value
                });
                this.messagelinksconfig = newDoc;
                this.cache.messagelinksconfig = true;
                return true;
            }
        }

        async getWelcome() {
            const doc = await welcome.findOne({ guildID: { $eq: this.id } });
            if (doc) {
                this.welcome = doc;
                this.cache.welcome = true;
                return doc;
            } else {
                const thing = await welcome.create({
                    guildID: this.id
                });
                this.welcome = thing;
                this.cache.welcome = true;
                return thing;
            }

        }
        /**
         * 
         * @param {number} tochange - Thing in the DB to change.
         * @param {boolean | string} newData - The new content.
         * @returns {boolean} Always true.
         * @throws {Error} Only in invalid data.
         */
        async setWelcome(tochange, newData) {
            let doc = await welcome.findOne({ guildID: { $eq: this.id } });
            if (!doc) {
                doc = await welcome.create({
                    guildID: this.id
                });
            }
            switch (tochange) {
                case 0: {
                    await doc.updateOne({ enabled: newData });
                    this.welcome.enabled = newData;
                    this.cache.welcome = true;
                    return true;
                }
                case 1: {
                    await doc.updateOne({ channelID: newData });
                    this.welcome.channelID = newData;
                    this.cache.welcome = true;
                    return true;
                }
                case 2: {
                    await doc.updateOne({ text: newData });
                    this.welcome.text = newData
                    this.cache.welcome = true;
                    return true;
                }
                case 3: {
                    await doc.updateOne({ dmenabled: newData });
                    this.welcome.dmenabled = newData
                    this.cache.welcome = true;
                    return true;
                }
                case 4: {
                    await doc.updateOne({ dmtext: newData });
                    this.welcome.dmtext = newData
                    this.cache.welcome = true;
                    return true;
                }
                case 5: {
                    await doc.updateOne({ leaveenabled: newData });
                    this.welcome.leaveenabled = newData
                    this.cache.welcome = true;
                    return true;
                }
                case 6: {
                    await doc.updateOne({ leavechannelID: newData });
                    this.welcome.leavechannelID = newData
                    this.cache.welcome = true;
                    return true;
                }
                case 7: {
                    await doc.updateOne({ leavetext: newData });
                    this.welcome.leavetext = newData
                    this.cache.welcome = true;
                    return true;
                }
                default:
                    throw new Error("Nope");
            }
        }
        async getWarnConfig() {
            let doc = await guildwarnconfig.findOne({ guildid: { $eq: this.id } });
            if (!doc) {
                doc = await guildwarnconfig.create({
                    guildid: this.id,
                    role: false,
                    kick: false,
                    ban: false
                });
            }
            this.warnsconfig = doc;
            this.cache.warnsconfig = true;
            return doc;
        }

        async editWarnConfig(tochange, newData) {
            let doc = await guildwarnconfig.findOne({ guildid: { $eq: this.id } });
            if (!doc) {
                doc = await guildwarnconfig.create({
                    guildid: this.id,
                    role: false,
                    kick: false,
                    ban: false
                });
            }
            switch (tochange) {
                case 0: {
                    await doc.updateOne({ role: newData });
                    this.warnsconfig.role = newData;
                    this.cache.warnsconfig = true;
                    return true;
                }
                case 1: {
                    await doc.updateOne({ roletime: newData });
                    this.warnsconfig.roletime = newData;
                    this.cache.warnsconfig = true;
                    return true;
                }
                case 2: {
                    await doc.updateOne({ roleid: newData });
                    this.warnsconfig.roleid = newData
                    this.cache.warnsconfig = true;
                    return true;
                }
                case 3: {
                    await doc.updateOne({ kick: newData });
                    this.warnsconfig.kick = newData
                    this.cache.warnsconfig = true;
                    return true;
                }
                case 4: {
                    await doc.updateOne({ kicktime: newData });
                    this.warnsconfig.kicktime = newData
                    this.cache.warnsconfig = true;
                    return true;
                }
                case 5: {
                    await doc.updateOne({ ban: newData });
                    this.warnsconfig.ban = newData
                    this.cache.warnsconfig = true;
                    return true;
                }
                case 6: {
                    await doc.updateOne({ bantime: newData });
                    this.warnsconfig.bantime = newData
                    this.cache.warnsconfig = true;
                    return true;
                }
                default:
                    throw new Error("Nope");
            }
        }

        noCache() {
            this.cache.customresponses = false;
            this.customresponses = {};
            this.cache.prefix = false;
            this.prefix = {};
            this.cache.levelconfig = false;
            this.levelconfig = {};
            this.cache.messagelinksconfig = false;
            this.messagelinksconfig = {};
            this.cache.welcome = false;
            this.welcome = {};
            this.autopostchannels = [];
            this.cache.autopostchannels = false;
            this.warnsconfig = {};
            this.cache.warnsconfig = false;
            return true;
        }
    };
});

Structures.extend("GuildMember", (GuildMember) => {
    return class extends GuildMember {
        constructor(client, data, guild) {
            super(client, data, guild);
            this.warns = [];
            this.cache = {
                warns: false
            }
        }
        async getWarns() {
            const docs = await memberwarns.find({ guildId: { $eq: this.guild.id }, memberId: { $eq: this.id } }).sort({ created: 'desc' }).exec();
            this.warns = docs;
            this.cache.warns = true;
            return docs;
        }
        async setWarn(reason = "") {
            const warns = this.cache.warns ? this.warns : await this.getWarns();
            this.cache.warns = false;
            const {
                role,
                roletime,
                roleid,
                kick,
                kicktime,
                ban,
                bantime
            } = this.guild.cache.warnsconfig ? this.guild.warnsconfig : await this.guild.getWarnConfig();

            await this.send(`You've been warned on ${this.guild.name}${reason ? (" with reason " + reason) : ""}. You have ${warns.length + 1} warning(s).`).catch(() => { });

            if (role && (roletime <= (warns.length + 1))) await this.roles.add(roleid, "Too many warnings").catch(() => { });
            if (kick && (kicktime == (warns.length + 1))) await this.kick("Too many warnings").catch(() => { });
            if (ban && (bantime == (warns.length + 1))) await this.ban({ reason: "Too many warnings" }).catch(() => { });

            await memberwarns.create({
                guildId: this.guild.id,
                memberId: this.id,
                reason
            });
            return warns.length + 1;
        }
        async deleteWarn(id, reason = "") {
            const warns = this.cache.warns ? this.warns : await this.getWarns();
            this.cache.warns = false;
            const deleted = await memberwarns.findById(id);
            if (!deleted) throw new StructureError("That ID doesn't exist!");
            if (deleted.memberId !== this.id) throw new StructureError("That ID doesn't exist!");
            if (deleted.guildId !== this.guild.id) throw new StructureError("That ID doesn't exist!");
            await deleted.deleteOne();
            await this.send(`You've been pardoned on ${this.guild.name}${reason ? (" with reason: " + reason) : ""}. Now you have ${warns.length} warnings.`).catch(() => { });
            return warns.length - 1;
        }
        noCache() {
            this.warns = [];
            this.cache.warns = false;
            return true;
        }
    }
})