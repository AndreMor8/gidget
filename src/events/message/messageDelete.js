import MessageModel from "../../database/models/ticket.js";
import MessageModel2 from "../../database/models/message.js";
import MessageModel3 from "../../database/models/poll.js";
export default async (bot, message) => {
  await MessageModel.findOneAndDelete({ messageId: message.id });

  await MessageModel2.findOneAndDelete({ messageId: message.id });

  await MessageModel3.findOneAndDelete({ messageId: message.id });


  if (message.partial) return;
  if (!message.guild) return;

  message.channel.snipe = message;
};
