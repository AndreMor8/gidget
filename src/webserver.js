const http = require("http");
const express = require("express");
const app = express();
app.use(express.static("public"));
app.get("/", function (request, response) {
  response.sendFile(__dirname + "/public/index.html");
});
app.get("/", (request, response) => {
  response.sendStatus(200);
});

setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}/`);
}, 180000);

const listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});