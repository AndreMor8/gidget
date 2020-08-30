class StructureError extends Error {
    constructor(error) {
        super();
        this.name = "StructureError";
        this.message = error;
    }
}
const fetch = require("node-fetch");
const prefix = require("./database/models/prefix");
const cr = require("./database/models/customresponses");
const level = require("./database/models/levelconfig");
const OAuth2 = require("./database/models/OAuth2Credentials");
const DiscordUser = require("./database/models/DiscordUser");
const MessageLinksModel = require("./database/models/messagelinks");
const CryptoJS = require("crypto-js");
const { Structures } = require("discord.js");

Structures.extend('Guild', Guild => {
    return class extends Guild {
        constructor(client, data) {
            super(client, data);
            this.queue = null;
            this.musicVariables = null;
            this.prefix = "g%";
            this.customresponses = {};
            this.levelconfig = {};
            this.messagelinksconfig = {};
            this.cache = {
                prefix: false,
                customresponses: false,
                levelconfig: false,
                messagelinksconfig: false,
            };
        }
        /**
         * @returns {String} The actual guild prefix
         */
        async getPrefix() {
            const doc = await prefix.findOne({ guildId: this.id });
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
         * @param {String} newPrefix The new server prefix
         * @returns {String} The new prefix
         */
        async setPrefix(newPrefix) {
            const doc = await prefix.findOneAndUpdate({ guildId: this.id }, { prefix: newPrefix });
            if (doc) {
                this.prefix = newPrefix;
                this.cache.prefix = true;
                return newPrefix;
            } else {
                const algo = await prefix.create({
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
         * @param {String} match The text string to check in each message
         * @param {Object} message The Discord.js message object to send
         * @returns {Boolean} Although if there is an error this will just throw it away.
         */
        async addCustomResponse(match, message) {
            const doc = await cr.findOne({ guildId: this.id });
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
         * @param {Number} index Number of index in the object to delete
         * @returns {Boolean} Although if there is an error this will just throw it away.
         */
        async deleteCustomResponse(index) {
            const doc = await cr.findOne({ guildId: this.id });
            if (!cr) {
                this.customresponses = {}
                this.cache.customresponses = true;
                throw new StructureError("There are no custom responses on this server...")
            } else {
                const keys = Object.keys(doc.responses);
                if (!keys.length) throw new StructureError("There are no custom responses on this server...");
                if (index <= keys.length && index >= 1) {
                    let word = keys[index - 1];
                    if (doc.responses.hasOwnProperty(word)) {
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
            const doc = await cr.findOne({ guildId: this.id });
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
            const doc = await level.findOne({ guildId: this.id });
            if(doc) {
                this.levelconfig = doc;
                this.cache.levelconfig = true;
                return doc;
            } else {
                this.levelconfig = {},
                this.cache.levelconfig = true;
                return {};
            }
        }
        /**
         * 
         * @param {String} config Config type 
         * @param {Boolean} value New value
         * @returns {Boolean} If the/a document was created/updated
         */
        async changeLevelConfig(config, value) {
            if(typeof value !== "boolean") return false;
            const doc = await level.findOne({ guildId: this.id });
            if(doc) {
                if(config === "levelnotif") {
                    doc.levelnotif = value;
                    await doc.save();
                    this.levelconfig = doc;
                    this.cache.levelconfig = true;
                    return true;
                } else if(config === "levelsystem") {
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
         * @returns {Object} The document
         */
        async getMessageLinksConfig() {
            const doc = await MessageLinksModel.findOne({ guildId: this.id });
            if(doc) {
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
         * @param {Boolean} value New value for the document
         * @returns {Boolean} Always true
         */
        async setMessageLinksConfig(value) {
            if(typeof value !== "boolean") throw new Error("'value' isn't a boolean");
            const doc = await MessageLinksModel.findOne({ guildID: this.id });
            if(doc) {
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
                this.messagelinksconfig = true;
                this.cache.messagelinksconfig = true;
                return true;
            }
        }

        noCache(){
            this.cache.customresponses = false;
            this.cache.prefix = false;
            this.cache.levelconfig = false;
            this.cache.messagelinksconfig = false;
            return true;
        }
    };
});

Structures.extend("User", (User) => {
    return class extends User {
        constructor(client, data) {
            super(client, data);
            this.premium_type = {
                type: null,
                value: -1
            };
            this.cache = {
                premium_type: false,
            }
        }
        async getPremiumType() {
            const thing = await OAuth2.findOne({ discordId: this.id });
            if(!thing) {;
                this.premium_type.type = null;
                this.premium_type.value = -1;
                this.cache.premium_type = true;
                setTimeout(() => {
                    this.cache.premium_type = false;
                }, 60000);
                return {
                    type: null,
                    value: -1
                };
            } else {
                const token = CryptoJS.AES.decrypt(thing.accessToken, process.env.VERYS);
                const dectoken = token.toString(CryptoJS.enc.Utf8);
                const res = await fetch(`https://discord.com/api/v6/users/@me`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${dectoken}`
                    }
                });
                const json = await res.json();
                if(json && (!json.message)) {
                    this.premium_type.type = "oauth2";
                    this.premium_type.value = json.premium_type || 0;
                    this.cache.premium_type = true;
                    setTimeout(() => {
                        this.cache.premium_type = false;
                    }, 60000);
                    return {
                        type: "oauth2",
                        value: json.premium_type || 0
                    };
                } else {
                    const otherthing = await DiscordUser.findOne({ discordId: this.id });
                    if(otherthing && otherthing.premium_type) {
                        this.premium_type.type = "db";
                        this.premium_type.value = otherthing.premium_type || 0;
                        this.cache.premium_type = true;
                        setTimeout(() => {
                            this.cache.premium_type = false;
                        }, 60000);
                        return {
                            type: "db",
                            value: otherthing.premium_type || 0
                        };
                    } else {
                        this.premium_type.type = null;
                        this.premium_type.value = -1;
                        this.cache.premium_type = true;
                        setTimeout(() => {
                            this.cache.premium_type = false;
                        }, 60000);
                        return {
                            type: null,
                            value: -1
                        };;
                    }
                }
            }
        }
    }
})

Structures.extend("TextChannel", TextChannel => {
    return class extends TextChannel {
        constructor(guild, data) {
            super(guild, data);
            this.snipe = null;
            setInterval(() => {
                this.snipe = null;
            }, 300000);
        }
        deleteSnipe() {
            this.snipe = null;
        }
    }
})