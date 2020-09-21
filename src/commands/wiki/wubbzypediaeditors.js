import Command from '../../utils/command.js';
import cheerio from "cheerio";
import { wiki } from "../../utils/wikilogin.js";
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["wpeditors", "wpe", "editorsrole", "er", "wper"];
    this.onlyguild = true;
    this.description = "When the requirements are met, give the Wubbzypedia Editors role to that person";
    this.permissions = {
      user: [0, 0],
      bot: [268435456, 0]
    };
  }
  async run(message, args) {
    if (!args[1]) return message.channel.send("Usage: `wubbzypediaeditors <wiki username>`");
    try {
      const user = await wiki.whoisAsync(args.slice(1).join(" "));
      if (!user) return message.channel.send("Invalid user!");
      const content = await wiki.fetchUrlAsync("https://services.fandom.com/user-attribute/user/" + user.userid + "/attr/discordHandle?format=json");
      let json = JSON.parse(content);
      if (json.status)
        return message.channel.send("Error while fetching the Discord tag: " + json.title + "\nStatus: " + json.status);
      if (json.value === message.author.tag) {
        const content = await wiki.fetchUrlAsync("https://wubbzy.fandom.com/wiki/Special:Editcount/" + user.name.replace(/ /g, "_"));
        let $ = cheerio.load(content);

        var mount1 = $("#editcount > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(3) > td.ecrowcenter");

        var url = new Array(mount1.length).fill(0).map((v, i) => mount1.eq(i).attr("class", "ecrowcenter").html());
        if (url[0] === "(Main)") {
          var mount = $("#editcount > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(3) > td:nth-child(2)");

          var urls = new Array(mount.length).fill(0).map((v, i) => mount.eq(i).attr("class", "ecrowright").html());
          urls[0] = urls[0].replace(/,/g, "");
          let number = parseInt(urls[0]);
          if (!isNaN(number) && number > 100) {
            message.member.roles.add("608624771382378507").then(() => message.channel.send("Excellent, " + user.name + "! Now you have the Wubbzypedia Editors role!")).catch(err => message.channel.send("Error: " + err));
          } else {
            message.channel.send("Sorry, you don't have enough edits to have the Wubbzypedia Editors role. The requirement is 100 editions in namespace 0 (main/article).\nCheck your namespace edits: https://wubbzy.fandom.com/wiki/Special:Editcount/" + user.name.replace(/ /g, "_") + "\nNamespace 0 edits: " + urls[0] + "\nTotal edits: " + user.editcount);
          }
        } else {
          message.channel.send("It looks like you haven't done any edit in namespace 0 (articles). If you already have, come back later!");
        }
      } else {
        message.channel.send("Make sure you put your Discord tag right!");
      }
    } catch (err) {
      console.log(err);
      message.channel.send("Error: " + err);
    }
  }
}
