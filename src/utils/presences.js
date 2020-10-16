export default (bot) => {
  const i = Math.floor(Math.random() * 7);
  switch (i) {
    case 0:
      bot.user
        .setPresence({
          activity: { name: "Wubbzy's songs", type: "LISTENING" },
          status: "online",
        })
        .catch(console.error);
      break;
    case 1:
      bot.user
        .setPresence({
          activity: { name: "Wubbzy's episodes", type: "WATCHING" },
          status: "online",
        })
        .catch(console.error);
      break;
    case 2:
      bot.user
        .setPresence({
          activity: { name: "Wubbzy's games", type: "PLAYING" },
          status: "online",
        })
        .catch(console.error);
      break;
    case 3:
      bot.user
        .setPresence({
          activity: { name: "with Wubbzy", type: "PLAYING" },
          status: "online",
        })
        .catch(console.error);
      break;
    case 4:
      bot.user
        .setPresence({
          activity: { name: "with Widget", type: "PLAYING" },
          status: "online",
        })
        .catch(console.error);
      break;
    case 5:
      bot.user
        .setPresence({
          activity: { name: "with Walden", type: "PLAYING" },
          status: "online",
        })
        .catch(console.error);
      break;
    case 6:
      bot.user
        .setPresence({
          activity: { name: "with Daizy", type: "PLAYING" },
          status: "online",
        })
        .catch(console.error);
      break;
  }
}