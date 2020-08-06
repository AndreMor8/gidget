const DS = require('passport-discord').Strategy;
const DiscordUser = require("../../database/models/DiscordUser.js");
const passport = require('passport');

passport.serializeUser((user, done) => {
  done(null, user.discordId)
})

passport.deserializeUser(async (id, done) => {
  const user = await DiscordUser.findOne({ discordId: id });
  if(user) done(null, user)
})

passport.use(new DS({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callback: process.env.CLIENT_REDIRECT,
  scope: ['identify', 'guilds']
}, async (acc, ref, p, done) => {
try {
        const user = await DiscordUser.findOne({ discordId: p.id });
        if(user)
        {
            await user.updateOne({
                username: `${p.username}#${p.discriminator}`,
                guilds: p.guilds
            });
            done(null, user);
        }
        else {
            const newUser = new DiscordUser({
                discordId: p.id,
                username: `${p.username}#${p.discriminator}`,
                guilds: p.guilds
            });
            const savedUser = await newUser.save();
            done(null, savedUser);
        }
    }
    catch(err) {
        console.log(err);
        done(err, null);
    }
}))