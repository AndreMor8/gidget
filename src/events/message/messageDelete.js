import model1 from "../../database/models/ticket.js";
import model2 from "../../database/models/message.js";
import model3 from "../../database/models/poll.js";
import model4 from '../../database/models/message.js';
export default async (bot, message) => {
  await model1.findOneAndDelete({ messageId: message.id });

  await model2.findOneAndDelete({ messageId: message.id });

  await model3.findOneAndDelete({ messageId: message.id });

  const rrres = await model4.findOneAndDelete({ messageId: message.id });
  if (rrres) bot.cachedMessageReactions.delete(message.id);

  /*if (message.partial) return;
  if (!message.guild) return;

  message.channel?.setSnipe(message);*/
};
