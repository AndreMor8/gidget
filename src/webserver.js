const { bot } = require('./index.js');
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get("/", async (req, res) => {
  console.log(req.headers);
  if(req.query && req.query.delete) {
    console.log(req.query);
  }
  res.status(200).send("Good");
});

const listener = app.listen(8080, function () {
  console.log("Your app is listening on port " + listener.address().port);
});

function deleteCache(bot, guildID) {
  bot.cachedMessageReactions.delete(guildID);
  bot.autoresponsecache.delete(guildID);
  bot.level.delete(guildID);
  bot.rrcache.delete(guildID);
  bot.guildprefix.delete(guildID);
}