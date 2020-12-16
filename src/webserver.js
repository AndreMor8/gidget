import http from 'http';
/**
 * 
 * @param {object} bot - Discord Client. 
 */
export default function (sharder) {
  const listener = http.createServer(async (req, res) => {
    if (req.headers.pass !== process.env.ACCESS) {
      res.statusCode = 200;
      res.end("You don't have authorization");
      return;
    }
    try {
      const todelete = new URL("http://localhost:8080" + req.url).searchParams.get("delete");
      if (todelete) {
        const post = await deleteCache(todelete);
        if (post) {
          res.statusCode = 200;
          res.end("Good.");
        } else {
          res.statusCode = 404;
          res.end("Something's bad. Maybe server ID doesn't exist");
        }
      } else {
        res.statusCode = 200;
        res.end("Good.");
      }
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
   * @returns {boolean} Always true (when the server is found).
   */
  async function deleteCache(guildID) {
    if(isNaN(guildID)) return false;
    const res = await sharder.fetchClientValues(`guilds.cache.get('${guildID}')?.noCache()`);
    if(res.find(e => Boolean(e))) return true;
    else return false;
  }
}
