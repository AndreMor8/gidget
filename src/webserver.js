import http from 'http';
/**
 * 
 * @param {object} bot - Discord Client. 
 */
export default function (bot) {
  const listener = http.createServer((req, res) => {
    if (req.headers.pass !== process.env.ACCESS) {
      res.statusCode = 403;
      res.end("You don't have authorization");
      return;
    }
    try {
      const todelete = new URL("http://localhost:8080" + req.url).searchParams.get("delete");
      if (todelete) deleteCache(todelete);
      res.statusCode = 200;
      res.end("Good.");
    } catch (err) {
      console.log(err);
      res.statusCode = 500;
      res.end("Something happened! " + err);
    }
  }).listen(process.env.PORT, () => {
    console.log(`Your app is listening on port ${listener.address().port}`);
  });
  /**
   * @param {string} guildID - Server ID to delete cache.
   * @returns {boolean} Always true.
   */
  function deleteCache(guildID) {
    bot.cachedMessageReactions.delete(guildID);
    bot.rrcache.delete(guildID);
    const guild = bot.guilds.cache.get(guildID);
    if (guild) {
      guild.noCache();
      return true;
    } else return false;
  }
}
