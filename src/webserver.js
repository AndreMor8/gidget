import express from 'express';
/**
 * @param {object} bot - Discord Client.
 */
export default function (sharder) {
  const app = express();
  app.get("/ping", (req, res) => {
    res.status(200).send("Good!");
  });
  app.use((req, res, next) => {
    if (req.headers["pass"] !== process.env.ACCESS) {
      res.status(200).send("You don't have authorization");
    } else next();
  });
  app.get("/guilds", async (req, res) => {
    const servers = await sharder.broadcastEval(c => c.guilds.cache.map(e => e.id));
    const merged = Array.prototype.concat.apply([], servers);
    return res.json(merged);
  });
  app.get("/", async (req, res) => {
    try {
      const todelete = req.query["delete"];
      if (todelete) {
        const post = await deleteCache(todelete);
        if (post) {
          res.status(200).send("Good.");
        } else {
          res.status(404).send("Something's bad. Maybe server ID doesn't exist");
        }
      } else {
        res.status(200).send("Specify a server!");
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("Something happened! " + err);
    }
  });
  const listener = app.listen(process.env.PORT, () => {
    console.log("Your app is listening on port " + listener.address().port);
  });
  /**
   * @param {string} guildID - Server ID to delete cache.
   * @returns {Promise<boolean>} Always true (when the server is found).
   */
  async function deleteCache(guildID) {
    if (isNaN(guildID)) return false;
    const res = await sharder.broadcastEval((c, { g }) => {
      return c.guilds.cache.get(g)?.noCache();
    }, { context: { g: guildID } });
    if (res.find(e => Boolean(e))) return true;
    else return false;
  }
}