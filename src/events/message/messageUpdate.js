export default (bot, oldMessage, newMessage) => {
  if(newMessage.partial) return;
  if(newMessage.author.bot) return;
  //No embed repeats
  if(oldMessage.content === newMessage.content) return;
  if(newMessage.createdAt.getTime() < new Date(Date.now() - 120000)) return;
  bot.emit("message", newMessage, true)
}