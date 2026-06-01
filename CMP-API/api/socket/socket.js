import { Message } from "../model/message.schema.js";
import { Chat } from "../model/chat.schema.js";

export const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
    });

    socket.on("send_message", async (data) => {
      const { chatId, sender, text, messageType } = data;
      
      try {
        const newMessage = new Message({
          chatId,
          sender,
          text,
          messageType: messageType || "text",
        });

        await newMessage.save();

        // Update last message in Chat
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: newMessage._id,
        });

        // Populate sender info before emitting
        const populatedMessage = await Message.findById(newMessage._id).populate("sender", "userName");

        io.to(chatId).emit("receive_message", populatedMessage);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};