export default (bot) => {
  const presences = [
    [{ name: "Wubbzy's songs", type: "LISTENING" }],
    [{ name: "Wubbzy's episodes", type: "WATCHING" }],
    [{ name: "Wubbzy's games", type: "PLAYING" }],
    [{ name: "with Wubbzy", type: "PLAYING" }],
    [{ name: "with Widget", type: "PLAYING" }],
    [{ name: "with Walden", type: "PLAYING" }],
    [{ name: "with Daizy", type: "PLAYING" }],
  ]
  
  const i = Math.floor(Math.random() * presences.length);
  bot.user.setPresence({
    activities: i,
    status: "online",
  })
}