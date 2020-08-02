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
  if (req.headers.pass !== process.env.SECRET) return res.status(403).send("You don't have authorization");
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
  res.status(200).send("Good");
});

const listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});

function deleteCache(guildID) {
  bot.cachedMessageReactions.delete(guildID);
  bot.autoresponsecache.delete(guildID);
  bot.level.delete(guildID);
  bot.rrcache.delete(guildID);
  bot.guildprefix.delete(guildID);
}