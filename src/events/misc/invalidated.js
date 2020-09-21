export default async bot => {
  console.log("The session has become invalid!");
  setTimeout(() => {
    bot.destroy();
    process.exit(1);
  }, 250);
}