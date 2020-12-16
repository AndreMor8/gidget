import { BaseCluster } from 'kurasuta';
import Discord from 'discord.js';
//Database
import database from "./database/database.js";
//Registry for commands and events
import { registerCommands, registerEvents } from './utils/registry.js';
//Other packages
import DBL from 'dblapi.js';

//Global definitions
global.botIntl = Intl.DateTimeFormat("en", { weekday: "long", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/New_York", hour12: true, timeZoneName: "short" });
global.botVersion = "0.99 RC";
export default class extends BaseCluster {
  async launch() {
    //top.gg
    if (process.env.EXTERNAL === "yes") {
      this.client.dbl = new DBL(process.env.DBLKEY, this.client);
      this.client.dbl.on("posted", () => {
        console.log("tog.gg: Server count posted!");
      });
      this.client.dbl.on("error", e => {
        console.error("top.gg: Error:", e);
      });
    }
    //Database
    await database();
    //Commands
    await registerCommands("../commands");
    //Cache system
    this.client.cachedMessageReactions = new Discord.Collection();
    this.client.rrcache = new Discord.Collection();
    //Registers
    await registerEvents(this.client, "../events");
    //Login with Discord
    return await this.client.login();
  }
}