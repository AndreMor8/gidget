const { bot, version } = require('../index.js');
const express = require("express");
const passport = require("passport");
const app = express();
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const DS = require("./strategies/discord.js");
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(
  session({
    secret: process.env.SECRET,
    cookie: {
      maxAge: 60000 * 60 * 24
    },
    saveUninitialized: false,
    resave: false,
    name: "discord.oauth2",
    store: new MongoStore({ mongooseConnection: require("mongoose").connection })
  })
);
app.set("view engine", "ejs");
app.set("views", require("path").join(__dirname, "views"));
app.use(passport.initialize());
app.use(passport.session());
app.use("/auth", require("./routes/auth"));
app.use("/dashboard", require("./routes/dashboard"));
app.use("/wwd", require("./routes/wwd"));

app.get("/", (req, res) => {
  if (req.query && req.query.delete) {
    if (req.headers && (req.headers.pass === process.env.ACCESS)) {
      deleteCache(req.query.delete);
    }
  }
  if (req.user) {
    res.render("home", {
      username: req.user.username,
      user: req.user,
      logged: true
    });
  } else {
    res.render("home", {
      username: "strange",
      user: req.user,
      logged: false
    });
  }
});

app.get("/ping", (req, res) => {
  res.status(200).send("Gidget is alive, version " + version)
})

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
