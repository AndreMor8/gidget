const { bot } = require('./index.js');
const http = require("http");
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get("/", async (req, res) => {
  if (!req.headers) return res.status(403).send("You don't have authorization");
  if (req.headers.pass !== process.env.SECRET) return res.status(403).send("You don't have authorization");
  if(req.query && req.query.guild) {
    deleteCache(req.query.guild);
  }
  res.status(200).send("Good");
});

const listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});

setInterval(() => {
  http.get("http://" + process.env.PROJECT_DOMAIN + "/");
}, 90000);

function deleteCache(guildID) {
  bot.cachedMessageReactions.delete(guildID);
  bot.autoresponsecache.delete(guildID);
  bot.level.delete(guildID);
  bot.rrcache.delete(guildID);
  bot.guildprefix.delete(guildID);
}