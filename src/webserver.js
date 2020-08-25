const { bot } = require('./index.js');
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get("/", async (req, res) => {
  if (!req.headers) return res.status(403).send("You don't have authorization");
  if (req.headers.pass !== process.env.ACCESS) return res.status(403).send("You don't have authorization");
  try {
  if(req.query && req.query.delete) {
    deleteCache(req.query.delete);
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

function deleteCache(guildID) {
  bot.cachedMessageReactions.delete(guildID);
  bot.rrcache.delete(guildID);
  const guild = bot.guilds.cache.get(guildID);
  if(guild) {
    guild.cache.prefix = false;
    guild.cache.customresponses = false;
    guild.cache.levelconfig = false;
    return true;
  } else return false
}