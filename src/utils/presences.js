export default async (_self, bot) => {
  const presences = [
    [{ name: `@${bot.user.username} help`, type: 0 }],
  ];

  await bot.user.setPresence({
    activities: presences[Math.floor(Math.random() * presences.length)],
    status: "online",
  });
}