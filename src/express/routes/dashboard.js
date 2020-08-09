const router = require("express").Router();
const util = require("../utils/utils");
const fetch = require("node-fetch");
const dash = require("./dashboard/main.js");

function isAuthorized(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect("/");
  }
}

router.get("/", isAuthorized, async (req, res) => {
  const toshow = await util.getGuilds(req.user.guilds);
  res.status(200).render("dashboard0", {
    username: req.user.username,
    discordId: req.user.discordId,
    guilds: req.user.guilds,
    toshow: toshow,
    logged: true
  });
});

router.get("/guilds", isAuthorized, (req, res) => {
  const { guilds } = req.user;
  const guildMemberPermissions = new Map();
  guilds.forEach(guild => {
    const perm = util.getPermissions(guild.permissions);
    guildMemberPermissions.set(guild.id, perm);
  });

  res.render("guilds", {
    username: req.user.username,
    discordId: req.user.discordId,
    guilds: req.user.guilds,
    permissions: guildMemberPermissions,
    logged: true
  });
});

router.get("/settings", isAuthorized, (req, res) => {
  res.send(200);
});

router.get("/:guildID/", isAuthorized, async (req, res) => {
  if (req.params && req.params.guildID) {
    const toshow = await util.getGuilds(req.user.guilds);
    const guild = toshow.find(e => e.id === req.params.guildID);
    if (!guild)
      return res.status(403).send("That ID is not in your server list...");
    else
      res.status(200).render("dashboard1", {
        username: req.user.username,
        discordId: req.user.discordId,
        guilds: req.user.guilds,
        toshow: toshow,
        focus: req.params.guildID,
        logged: true,
        option: false
      });
  } else res.sendStatus(200);
});

router.get("/:guildID/:config", isAuthorized, dash.get);

router.post("/:guildID/:config", isAuthorized, dash.post);

module.exports = router;
