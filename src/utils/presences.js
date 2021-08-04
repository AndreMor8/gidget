export default (bot) => {
  const presences = [
    { name: "Wubbzy's songs", type: "LISTENING" },
    { name: "Wubbzy's episodes", type: "WATCHING" },
    { name: "Wubbzy's games", type: "PLAYING" },
    { name: "with Wubbzy", type: "PLAYING" },
    { name: "with Widget", type: "PLAYING" },
    { name: "with Walden", type: "PLAYING" },
    { name: "with Daizy", type: "PLAYING" },
  ];
  
  bot.user.setPresence({
    activities: presences[Math.floor(Math.random() * presences.length)],
    status: "online",
  })
}