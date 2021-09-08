import msgEvent from './messageCreate.js';
export default (bot, oldMessage, newMessage) => {
  if (!oldMessage) return;
  if (!newMessage?.content) return;
  if (newMessage.author.bot) return;
  //No embed repeats
  if (oldMessage.content === newMessage.content) return;
  if (newMessage.createdAt.getTime() < new Date(Date.now() - 120000)) return;
  msgEvent(bot, newMessage, true);
}