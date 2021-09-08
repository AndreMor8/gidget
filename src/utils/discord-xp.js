//Copied from discord-xp, to adapt it to my database configuration and updating two things.
//https://github.com/MrAugu/discord-xp // https://www.npmjs.com/package/discord-xp

import levels from "../database/models/levels.js";

export default class DiscordXp {
  constructor() {
    throw new Error("This class can't be instantiated");
  }
  /**
   * @param {string} [userId] - Discord user id.
   * @param {string} [guildId] - Discord guild id.
   */

  static async createUser(userId, guildId) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");

    const isUser = await levels.findOne({ userID: userId, guildID: guildId });
    if (isUser) return false;

    const newUser = new levels({
      userID: userId,
      guildID: guildId
    });

    await newUser.save().catch(e => console.log(`Failed to create user: ${e}`));

    return newUser;
  }

  /**
   * @param {string} [userId] - Discord user id.
   * @param {string} [guildId] - Discord guild id.
   */

  static async deleteUser(userId, guildId) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");

    const user = await levels.findOne({ userID: userId, guildID: guildId });
    if (!user) return false;

    await levels.findOneAndDelete({ userID: userId, guildID: guildId }).catch(e => console.log(`Failed to delete user: ${e}`));

    return user;
  }

  /**
   * @param {string} [userId] - Discord user id.
   * @param {string} [guildId] - Discord guild id.
   * @param {number} [xp] - Amount of xp to append.
   */

  static async appendXp(userId, guildId, xp) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");
    if (xp !== 0 && !xp) throw new TypeError("An amount of xp was not provided.");

    const user = await levels.findOne({ userID: userId, guildID: guildId });

    if (!user) {
      const newUser = new levels({
        userID: userId,
        guildID: guildId,
        xp: xp,
        level: Math.floor(0.1 * Math.sqrt(xp))
      });

      await newUser.save().catch(e => console.log(`Failed to save new user. ${e}`));

      return (Math.floor(0.1 * Math.sqrt(xp)) > 0);
    }

    user.xp += parseInt(xp, 10);
    user.level = Math.floor(0.1 * Math.sqrt(user.xp));

    await user.save().catch(e => console.log(`Failed to append xp: ${e}`));

    return (Math.floor(0.1 * Math.sqrt(user.xp -= xp)) < user.level);
  }

  /**
   * @param {string} [userId] - Discord user id.
   * @param {string} [guildId] - Discord guild id.
   * @param {number} [levels] - Amount of levels to append.
   */

  static async appendLevel(userId, guildId, levelss) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");
    if (!levelss) throw new TypeError("An amount of levels was not provided.");

    const user = await levels.findOne({ userID: userId, guildID: guildId });
    if (!user) return false;

    user.level += parseInt(levelss, 10);
    user.xp = user.level * user.level * 100;

    user.save().catch(e => console.log(`Failed to append level: ${e}`));

    return user;
  }

  /**
   * @param {string} [userId] - Discord user id.
   * @param {string} [guildId] - Discord guild id.
   * @param {number} [xp] - Amount of xp to set.
   */

  static async setXp(userId, guildId, xp) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");
    if (xp !== 0 && !xp) throw new TypeError("An amount of xp was not provided.");

    const user = await levels.findOne({ userID: userId, guildID: guildId });
    if (!user) return false;

    user.xp = xp;
    user.level = Math.floor(0.1 * Math.sqrt(user.xp));

    user.save().catch(e => console.log(`Failed to set xp: ${e}`));

    return user;
  }

  /**
   * @param {string} [userId] - Discord user id.
   * @param {string} [guildId] - Discord guild id.
   * @param {number} [level] - A level to set.
   */

  static async setLevel(userId, guildId, level) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");
    if (level !== 0 && !level) throw new TypeError("A level was not provided.");

    const user = await levels.findOne({ userID: userId, guildID: guildId });
    if (!user) return false;

    user.level = level;
    user.xp = level * level * 100;

    user.save().catch(e => console.log(`Failed to set level: ${e}`));

    return user;
  }

  /**
   * @param {string} [userId] - Discord user id.
   * @param {string} [guildId] - Discord guild id.
   */

  static async fetch(userId, guildId, fetchPosition = false) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");

    const user = await levels.findOne({ userID: userId, guildID: guildId });
    if (!user) return false;

    if (fetchPosition === true) {
      const leaderboard = await this.fetchLeaderboard(guildId);
      user.position = leaderboard.findIndex(i => i.userID === userId) + 1;
    }

    return user;
  }

  /**
   * @param {string} [userId] - Discord user id.
   * @param {string} [guildId] - Discord guild id.
   * @param {number} [xp] - Amount of xp to subtract.
   */

  static async subtractXp(userId, guildId, xp) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");
    if (xp !== 0 && !xp) throw new TypeError("An amount of xp was not provided.");

    const user = await levels.findOne({ userID: userId, guildID: guildId });
    if (!user) return false;

    user.xp -= xp;
    user.level = Math.floor(0.1 * Math.sqrt(user.xp));

    user.save().catch(e => console.log(`Failed to subtract xp: ${e}`));

    return user;
  }

  /**
   * @param {string} [userId] - Discord user id.
   * @param {string} [guildId] - Discord guild id.
   * @param {number} [levels] - Amount of levels to subtract.
   */

  static async subtractLevel(userId, guildId, levelss) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");
    if (!levelss) throw new TypeError("An amount of levels was not provided.");

    const user = await levels.findOne({ userID: userId, guildID: guildId });
    if (!user) return false;

    user.level -= levelss;
    user.xp = user.level * user.level * 100;

    user.save().catch(e => console.log(`Failed to subtract levels: ${e}`));

    return user;
  }

  /**
   * @param {string} [guildId] - Discord guild id.
   * @param {number} [limit] - Amount of maximum enteries to return.
   */

  static async fetchLeaderboard(guildId, limit) {
    if (!guildId) throw new TypeError("A guild id was not provided.");
    const users = await levels.find({ guildID: guildId }).sort([['xp', 'descending']]).exec();

    return (limit && (typeof limit === "number")) ? users.slice(0, limit) : users;
  }

  /**
   * @param {string} [client] - Your Discord.js client.
   * @param {Array} [leaderboard] - The output from 'fetchLeaderboard' function.
   */

  static computeLeaderboard(client, leaderboard) {
    if (!client) throw new TypeError("A Discord.js client was not provided.");
    if (!leaderboard) throw new TypeError("A leaderboard id was not provided.");

    if (leaderboard.length < 1) return [];

    const computedArray = leaderboard.map(key => {
      return {
        guildID: key.guildID,
        userID: key.userID,
        xp: key.xp,
        level: key.level,
        position: (leaderboard.findIndex(i => i.guildID === key.guildID && i.userID === key.userID) + 1),
        username: client.users.cache.get(key.userID) ? client.users.cache.get(key.userID).username : "Unknown",
        discriminator: client.users.cache.get(key.userID) ? client.users.cache.get(key.userID).discriminator : "0000",
        mention: client.users.cache.get(key.userID) ? client.users.cache.get(key.userID).toString() : `<@!` + key.userID + `>`,
        tag: client.users.cache.get(key.userID) ? client.users.cache.get(key.userID).tag : "Unknown (" + key.userID + ")",
      }
    });

    return computedArray;
  }

  /**
   * @param {number} [targetLevel] - Xp required to reach that level.
   */
  static xpFor(targetLevel) {
    if (isNaN(targetLevel) || isNaN(parseInt(targetLevel, 10))) throw new TypeError("Target level should be a valid number.");
    if (isNaN(targetLevel)) targetLevel = parseInt(targetLevel, 10);
    return targetLevel * targetLevel * 100;
  }

  /**
   * 
   * @param {string} [guildId] 
   * @param {number} [level]
   */
  static async removeFromLevel(guildID, level) {
    if (!guildID) throw new TypeError("A guild id was not provided.");
    if (typeof level !== "number") throw new TypeError("A level was not provided.");
    if (level < 0) throw new TypeError("A level was not provided.");
    return await levels.deleteMany({ guildID, level: { $lte: parseInt(level) } });
  }
}
