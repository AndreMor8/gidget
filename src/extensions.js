import prefix from "./database/models/prefix.js";
import cr from "./database/models/customresponses.js";
import level from "./database/models/levelconfig.js";
import welcome from "./database/models/welcome.js";
import MessageLinksModel from "./database/models/messagelinks.js";
import autopost from './database/models/autopost.js';
import guildwarnconfig from './database/models/warn.js';
import memberwarns from './database/models/warn2.js';
import confessions from './database/models/confessionconfig.js';
import fetch from "node-fetch";

//To differentiate user errors
class StructureError extends Error {
  constructor(error) {
    super();
    this.name = "StructureError";
    this.message = error;
  }
}

export async function getConfessionConfig(guild) {
  if (guild.confessionconfig && guild.cache?.confessionconfig) return guild.confessionconfig;
  const doc = await confessions.findOne({ guildID: { $eq: guild.id } }).lean();
  guild.confessionconfig = doc || {};
  if (!guild.cache) guild.cache = {};
  guild.cache.confessionconfig = true;
  return doc || {};
}

export async function setConfessionAnon(guild) {
  const doc = await confessions.findOne({ guildID: { $eq: guild.id } });
  if (!doc) throw new StructureError("First set a channel!");
  doc.anon = !doc.anon;
  await doc.save();
  guild.confessionconfig = doc || {};
  if (!guild.cache) guild.cache = {};
  guild.cache.confessionconfig = true;
  return doc.anon;
}

export async function setConfessionChannel(guild, channel) {
  let doc = await confessions.findOneAndUpdate({ guildID: { $eq: guild.id } }, { $set: { channelID: channel.id } }, { new: true });
  if (!doc) {
    doc = await confessions.create({
      guildID: guild.id,
      channelID: channel.id
    });
  }
  guild.confessionconfig = doc || {};
  if (!guild.cache) guild.cache = {};
  guild.cache.confessionconfig = true;
  return;
}

export async function deleteConfessionConfig(guild) {
  await confessions.deleteOne({ guildID: { $eq: guild.id } });
  guild.confessionconfig = {};
  if (!guild.cache) guild.cache = {};
  guild.cache.confessionconfig = true;
  return;
}

export async function setAutoPostChannel(guild, channel) {
  if (channel.type !== "GUILD_NEWS") throw new StructureError("Only news channels are allowed!");
  let doc = await autopost.findOneAndUpdate({ guildID: { $eq: guild.id } }, { $push: { channels: channel.id } }, { new: true }).lean();
  if (!doc) {
    doc = await autopost.create({
      guildID: guild.id,
      channels: [channel.id]
    });
  }
  guild.autopostchannels = doc.channels || [];
  if (!guild.cache) guild.cache = {};
  guild.cache.autopostchannels = true;
  return;
}

export async function deleteAutoPostChannel(guild, channel) {
  const id = channel?.id || (typeof channel === "string" ? channel : null);
  if (!id) throw new StructureError("Can't get channel ID!");
  if (isNaN(id)) throw new StructureError("Can't get channel ID!");
  const doc = await autopost.findOneAndUpdate({ guildID: { $eq: guild.id } }, { $pull: { channels: id } });
  if (!doc) {
    await autopost.create({
      guildID: guild.id,
      channels: []
    });
  }
  guild.autopostchannels = doc.channels || [];
  if (!guild.cache) guild.cache = {};
  guild.cache.autopostchannels = true;
  if (!doc.channels.includes(id)) throw new StructureError("There is no such channel in the DB.");
  return id;
}

export async function getAutoPostChannels(guild) {
  if (guild.autopostchannels && guild.cache?.autopostchannels) return guild.autopostchannels;
  let doc = await autopost.findOne({ guildID: { $eq: guild.id } });
  if (!doc) {
    doc = await autopost.create({
      guildID: guild.id,
      channels: []
    });
  }
  guild.autopostchannels = doc.channels || [];
  if (!guild.cache) guild.cache = {};
  guild.cache.autopostchannels = true;
  return doc.channels || [];
}

export async function getInviteCount(guild) {
  const col = await guild.invites.fetch();
  const invites = Array.from(col.values());
  const inviteCounter = {}

  for (const invite of invites) {
    const id = invite.inviter ? invite.inviter.id : invite.guild.id;
    inviteCounter[id] = (inviteCounter[id] ? parseInt(inviteCounter[id]) : undefined || 0) + (parseInt(invite.uses) || 0);
  }

  return inviteCounter;
}

export async function getPrefix(guild) {
  if (guild.prefix && guild.cache?.prefix) return guild.prefix;
  const doc = await prefix.findOne({ guildId: { $eq: guild.id } }).lean();
  if (doc) {
    guild.prefix = doc.prefix;
    if (!guild.cache) guild.cache = {};
    guild.cache.prefix = true;
    return doc.prefix;
  } else {
    guild.prefix = "g%";
    if (!guild.cache) guild.cache = {};
    guild.cache.prefix = true;
    return "g%";
  }
}

export async function setPrefix(guild, newPrefix) {
  const doc = await prefix.findOneAndUpdate({ guildId: { $eq: guild.id } }, { prefix: newPrefix }).lean();
  if (doc) {
    guild.prefix = newPrefix;
    if (!guild.cache) guild.cache = {};
    guild.cache.prefix = true;
    return newPrefix;
  } else {
    await prefix.create({
      guildId: guild.id,
      prefix: newPrefix,
    });
    guild.prefix = newPrefix;
    if (!guild.cache) guild.cache = {};
    guild.cache.prefix = true;
    return newPrefix;
  }
}

export async function addCustomResponse(guild, match, message) {
  const doc = await cr.findOne({ guildId: { $eq: guild.id } });
  if (doc) {
    const check = Object.keys(doc.responses).find(e => e === match);
    if (check) throw new StructureError("A key with that match already exists. First remove the key.");
    else {
      doc.responses[match] = message;
      await doc.updateOne({ responses: doc.responses });
      guild.customresponses = doc;
      if (!guild.cache) guild.cache = {};
      guild.cache.customresponses = true;
      return true;
    }
  } else {
    const algo = {};
    algo[match] = message;
    const esto = await cr.create({
      guildId: guild.id,
      responses: algo
    });
    guild.customresponses = esto;
    if (!guild.cache) guild.cache = {};
    guild.cache.customresponses = true;
    return true;
  }
}

export async function deleteCustomResponse(guild, index) {
  const doc = await cr.findOne({ guildId: { $eq: guild.id } });
  if (!cr) {
    guild.customresponses = {};
    if (!guild.cache) guild.cache = {};
    guild.cache.customresponses = true;
    throw new StructureError("There are no custom responses on this server...");
  } else {
    const keys = Object.keys(doc.responses);
    if (!keys.length) throw new StructureError("There are no custom responses on this server...");
    if (index <= keys.length && index >= 1) {
      const word = keys[index - 1];
      if (Object.prototype.hasOwnProperty.call(doc.responses, word)) {
        delete doc.responses[word];
        const a = Object.keys(doc.responses);
        if (a.length < 1) {
          await doc.deleteOne();
          guild.customresponses = {};
          if (!guild.cache) guild.cache = {};
          guild.cache.customresponses = true;
          return true;
        } else {
          await doc.updateOne({ responses: doc.responses });
          guild.customresponses = doc;
          if (!guild.cache) guild.cache = {};
          guild.cache.customresponses = true;
          return true;
        }
      } else throw new StructureError("Doesn't have their own property? Report this to AndreMor");
    } else throw new StructureError("Invalid ID");
  }
}
export async function getCustomResponses(guild) {
  if (guild.customresponses && guild.cache?.customresponses) return guild.customresponses;
  const doc = await cr.findOne({ guildId: { $eq: guild.id } }).lean();
  if (doc) {
    guild.customresponses = doc;
    if (!guild.cache) guild.cache = {};
    guild.cache.customresponses = true;
    return doc;
  } else {
    guild.customresponses = {};
    if (!guild.cache) guild.cache = {};
    guild.cache.customresponses = true;
    return {};
  }
}
export async function getLevelConfig(guild) {
  if (guild.levelconfig && guild.cache?.levelconfig) return guild.levelconfig;
  let doc = await level.findOne({ guildId: { $eq: guild.id } });
  if (!doc) {
    doc = await level.create({
      guildId: guild.id,
      levelnotif: false,
      levelsystem: false,
      roles: []
    });
  }
  guild.levelconfig = doc;
  if (!guild.cache) guild.cache = {};
  guild.cache.levelconfig = true;
  return doc;
}

export async function changeLevelConfig(guild, config, value) {
  if (typeof value !== "boolean") return false;
  const doc = await getLevelConfig(guild);
  if (config === "levelnotif") {
    doc.levelnotif = value;
    await doc.save();
    guild.levelconfig = doc;
    guild.cache.levelconfig = true;
    return true;
  } else if (config === "levelsystem") {
    doc.levelsystem = value;
    await doc.save();
    guild.levelconfig = doc;
    guild.cache.levelconfig = true;
    return true;
  } else return false;
}
export async function getMessageLinksConfig(guild) {
  if (guild.messagelinksconfig && guild.cache?.messagelinksconfig) return guild.messagelinksconfig;
  let doc = await MessageLinksModel.findOne({ guildID: { $eq: guild.id } });
  if (!doc) {
    doc = await MessageLinksModel.create({
      guildID: guild.id,
      enabled: false
    });
  }
  guild.messagelinksconfig = doc;
  if (!guild.cache) guild.cache = {};
  guild.cache.messagelinksconfig = true;
  return doc;
}


export async function setMessageLinksConfig(guild, value) {
  if (typeof value !== "boolean") throw new Error("'value' isn't a boolean");
  const doc = await getMessageLinksConfig(guild);
  await doc.updateOne({ enabled: value });
  guild.messagelinksconfig = doc;
  guild.messagelinksconfig.enabled = value;
  return true;
}

export async function getWelcome(guild) {
  if (guild.welcome && guild.cache?.welcome) return guild.welcome;
  let doc = await welcome.findOne({ guildID: { $eq: guild.id } });
  if (!doc) {
    doc = await welcome.create({
      guildID: guild.id
    });
  }
  guild.welcome = doc;
  if (!guild.cache) guild.cache = {};
  guild.cache.welcome = true;
  return doc;
}

export async function setWelcome(guild, tochange, newData) {
  const doc = await getWelcome(guild);
  switch (tochange) {
    case 0: {
      await doc.updateOne({ enabled: newData });
      guild.welcome.enabled = newData;
    }
      break;
    case 1: {
      await doc.updateOne({ channelID: newData });
      guild.welcome.channelID = newData;
    }
      break;
    case 2: {
      await doc.updateOne({ text: newData });
      guild.welcome.text = newData;
    }
      break;
    case 3: {
      await doc.updateOne({ dmenabled: newData });
      guild.welcome.dmenabled = newData;
    }
      break;
    case 4: {
      await doc.updateOne({ dmtext: newData });
      guild.welcome.dmtext = newData;
    }
      break;
    case 5: {
      await doc.updateOne({ leaveenabled: newData });
      guild.welcome.leaveenabled = newData;
    }
      break;
    case 6: {
      await doc.updateOne({ leavechannelID: newData });
      guild.welcome.leavechannelID = newData;
    }
      break;
    case 7: {
      await doc.updateOne({ leavetext: newData });
      guild.welcome.leavetext = newData;
    }
      break;
    default:
      throw new Error("Nope");
  }
  return true;
}
export async function getWarnConfig(guild) {
  if (guild.warnsconfig && guild.cache?.warnsconfig) return guild.warnsconfig;
  let doc = await guildwarnconfig.findOne({ guildid: { $eq: guild.id } });
  if (!doc) {
    doc = await guildwarnconfig.create({
      guildid: guild.id,
      role: false,
      kick: false,
      ban: false
    });
  }
  guild.warnsconfig = doc;
  if (!guild.cache) guild.cache = {};
  guild.cache.warnsconfig = true;
  return doc;
}

export async function editWarnConfig(guild, tochange, newData) {
  const doc = await getWarnConfig(guild);
  switch (tochange) {
    case 0: {
      await doc.updateOne({ role: newData });
      guild.warnsconfig.role = newData;
    }
      break;
    case 1: {
      await doc.updateOne({ roletime: newData });
      guild.warnsconfig.roletime = newData;
    }
      break;
    case 2: {
      await doc.updateOne({ roleid: newData });
      guild.warnsconfig.roleid = newData
    }
      break;
    case 3: {
      await doc.updateOne({ kick: newData });
      guild.warnsconfig.kick = newData
    }
      break;
    case 4: {
      await doc.updateOne({ kicktime: newData });
      guild.warnsconfig.kicktime = newData
    }
      break;
    case 5: {
      await doc.updateOne({ ban: newData });
      guild.warnsconfig.ban = newData
    }
      break;
    case 6: {
      await doc.updateOne({ bantime: newData });
      guild.warnsconfig.bantime = newData
    }
      break;
    default:
      throw new Error("Nope");
  }
  return true;
}

export function guildNoCache(guild) {
  if (!guild) return false;
  if (!guild.cache) guild.cache = {};
  guild.cache.customresponses = false;
  guild.customresponses = {};
  guild.cache.prefix = false;
  guild.prefix = {};
  guild.cache.levelconfig = false;
  guild.levelconfig = {};
  guild.cache.messagelinksconfig = false;
  guild.messagelinksconfig = {};
  guild.cache.welcome = false;
  guild.welcome = {};
  guild.autopostchannels = [];
  guild.cache.autopostchannels = false;
  guild.warnsconfig = {};
  guild.cache.warnsconfig = false;
  return true;
}

export async function getWarns(member) {
  if (member.warns && member.cache?.warns) return member.warns;
  const docs = await memberwarns.find({ guildId: { $eq: member.guild.id }, memberId: { $eq: member.id } }).sort({ created: 'desc' }).lean();
  member.warns = docs;
  if (!member.cache) member.cache = {};
  member.cache.warns = true;
  return docs;
}

export async function setWarn(member, reason = "") {
  const warns = await getWarns(member);
  const {
    role,
    roletime,
    roleid,
    kick,
    kicktime,
    ban,
    bantime
  } = await getWarnConfig(member.guild);

  await member.send(`You've been warned on ${member.guild.name}${reason ? (" with reason " + reason) : ""}. You have ${warns.length + 1} warning(s).`).catch(() => { });

  if (role && (roletime <= (warns.length + 1))) await member.roles.add(roleid, "Too many warnings").catch(() => { });
  if (kick && (kicktime == (warns.length + 1))) await member.kick("Too many warnings").catch(() => { });
  if (ban && (bantime == (warns.length + 1))) await member.ban({ reason: "Too many warnings" }).catch(() => { });

  member.warns.push(await memberwarns.create({
    guildId: member.guild.id,
    memberId: member.id,
    reason
  }));
  return warns.length;
}
export async function deleteWarn(member, id, reason = "") {
  const deleted = await memberwarns.findById(id).catch(() => { });
  if (!deleted) throw new StructureError("That ID doesn't exist!");
  if (deleted.memberId !== member.id) throw new StructureError("That ID doesn't exist!");
  if (deleted.guildId !== member.guild.id) throw new StructureError("That ID doesn't exist!");
  await deleted.deleteOne();
  if(member.cache?.warns) member.cache.warns = false;
  await getWarns(member);
  await member.send(`You've been pardoned on ${member.guild.name}${reason ? (" with reason: " + reason) : ""}. Now you have ${member.warns.length} warnings.`).catch(() => { });
  return member.warns.length;
}

export function memberNoCache(member) {
  member.warns = [];
  if (!member.cache) member.cache = {};
  member.cache.warns = false;
  return true;
}

export async function getBuffer(url) {
  return (await fetch(url)).buffer();
}