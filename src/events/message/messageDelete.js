import model1 from "../../database/models/ticket.js";
import model2 from "../../database/models/message.js";
import model3 from "../../database/models/poll.js";

export default async (bot, message) => {
  await model1.deleteOne({ messageId: { $eq: message.id } }).exec();
  await model3.deleteOne({ messageId: { $eq: message.id } }).exec();
  await model2.deleteOne({ messageId: { $eq: message.id } }).exec();
  bot.cachedMessageReactions.delete(message.id);
};
