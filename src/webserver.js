const { bot } = require('./index.js');
const http = require("http");
const express = require("express");
const app = express();

async function roles(guildID, memberID) {
  const guild = bot.guilds.cache.get(guildID);
  if(!guild) return false;
  const member = guild.members.cache.get(memberID) || memberID ? await guild.members.fetch(memberID).catch(err => {}) : undefined
  if(!member) return false;
  return member.roles.cache.map(r => {
    return {
      name: r.name,
      id: r.id
    }
  })
}

function guilds(memberId) {
  if(memberId) {
    return bot.guilds.cache.filter(e => e.members.cache.has(memberId)).map(e => e.id);
  } else {
    return bot.guilds.cache.map(e => e.id);
  }
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get("/", async (req, res) => {
  if (!req.headers) return res.status(403).send("You don't have authorization");
  if (req.headers.pass !== process.env.ACCESS) return res.status(403).send("You don't have authorization");
  try {
  if(req.query && req.query.delete) {
    deleteCache(req.query.delete);
  }
  if(req.query && req.query.guild && req.query.member) {
    const tosend = await roles(req.query.guild, req.query.member);
    if(!tosend) return res.status(404).send({
      status: 404,
      error: "The selected server or member was not found"
    })
    else return res.status(200).send({
      guildID: req.query.guild,
      memberID: req.query.member,
      roles: tosend
    })
  }
  if(req.query && req.query.guilds) {
    let tosend
    if(req.query.member) {
      tosend = guilds(req.query.member);
    } else {
      tosend = guilds();
    }
    if (!tosend) return res.status(404).send({
      status: 404,
      error: "The selected server was not found"
    });
    return res.status(200).send({
      memberID: req.query.member || null,
      guilds: tosend
    })

  }

  if(req.query && req.query.bans) {
    const info = await bans(req.query.bans);
    if(!info) return res.status(404).send("No se encontró el servidor");
    return res.status(200).send({
      guildID: req.query.bans,
      bans: info
    });
  }

  if(req.query && req.query.guild && req.query.unban) {
    const info = await unban(req.query.guild, req.query.unban);
    if(!info) return res.status(404).send("Servidor no encontrado o miembro no está baneado");
    return res.status(202).send("Desbaneado");
  }

  res.status(200).send("Good");
  } catch (err) {
    console.log(err);
    res.status(500).send("Something happened! " + err);
  }
});

const listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});

async function bans(guildID) {
  const guild = bot.guilds.cache.get(guildID);
  if(!guild) return false;
  const bans = await guild.fetchBans();
  return bans.map((b, i) => {
    return {
      userID: i,
      reason: b.reason
    }
  })
}

async function unban(guildID, userID) {
  const guild = bot.guilds.cache.get(guildID);
  if(!guild) return false;
  const algo = await bans(guildID);
  if(algo.find((e) => e.userID === userID)) {
    await guild.members.unban(userID);
    return true;
  } else {
    return false;
  }
}

function deleteCache(guildID) {
  bot.cachedMessageReactions.delete(guildID);
  bot.autoresponsecache.delete(guildID);
  bot.level.delete(guildID);
  bot.rrcache.delete(guildID);
  bot.guildprefix.delete(guildID);
}