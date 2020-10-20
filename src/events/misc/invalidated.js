export default async bot => {
  bot.destroy();
  console.log("The session has become invalid!");
  process.exit(1);
}