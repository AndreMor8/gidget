const levels = require("../../../database/models/levelconfig.js");
const util = require("../../utils/utils");
const fetch = require("node-fetch");
const pf = require("./prefix.js");
const lf = require('./levels.js');
const cp = require("./cp.js");
module.exports = {
  get: async (req, res) => {
    if (req.params && req.params.guildID && req.params.config) {
    const toshow = await util.getGuilds(req.user.guilds);
    const guild = toshow.find(e => e.id === req.params.guildID);
    if (!guild) return res.status(403).send("That ID is not in your server list...");
    else {
      /* Things for options */
      let data;
      if (req.params.config === "levels") {
        data = await lf.get(req.params.guildID)
      }
      if (req.params.config === "prefix") {
        data = await pf.get(req.params.guildID);
      }
      if(req.params.config === "cp") {
        data = await cp.get(req.params.guildID);
      }
      if (req.params.config === "cp" && req.query && req.query.delete) {
        await cp.delete(req.params.guildID, req.query.delete);
        util.deleteCache(req.params.guildID);
        return res.redirect("/dashboard/" + req.params.guildID + "/cp")
      }

      /* Render the data to front-end */
      res.status(200).render("dashboard1", {
        username: req.user.username,
        discordId: req.user.discordId,
        guilds: req.user.guilds,
        toshow: toshow,
        focus: req.params.guildID,
        logged: true,
        option: req.params.config,
        data: data
      });
    }
  } else res.sendStatus(200);
  },
  post: async (req, res) => {
   if (req.params && req.params.guildID && req.params.config) {
    const toshow = await util.getGuilds(req.user.guilds);
    const guild = toshow.find(e => e.id === req.params.guildID);
    if (!guild)
      return res.status(403).send("That ID is not in your server list...");
    else {
      /* Things for options */
      if (req.params.config === "levels" && req.body && req.body.system && req.body.notif) {
        await lf.post(req);
      }
      if (req.params.config === "prefix" && req.body) {
        await pf.post(req);
      }
      if (req.params.config === "cp" && req.body.match && req.body.response) {
        await cp.post(req);
      }
      if (req.params.config === "cp" && req.body.id) {
        await cp.delete(req.params.guildID, req.body.id);
      }
      util.deleteCache(req.params.guildID)
      /* Render the data to front-end */
      res.redirect("/dashboard/" + req.params.guildID + "/" + req.params.config)
    }
  } else
    res.sendStatus(200);
}             
}