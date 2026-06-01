// import { Chat } from "../model/chat.schema.js";
// import { Message } from "../model/message.schema.js";
// import { Product } from "../model/product.schema.js";

// export const createChat = async (req, res) => {
//   try {
//     const { receiverId, productId } = req.body;
//     const senderId = req.user.id;

//     if (senderId === receiverId) {
//       return res.status(400).json({ message: "You cannot chat with yourself" });
//     }

//     // Check if a 1-to-1 chat already exists between these two users (ignoring previous product)
//     let chat = await Chat.findOne({
//       participants: { $size: 2, $all: [senderId, receiverId] },
//     });

//     if (chat) {
//       // If the product context is different, create a "Product" message as a separator
//       if (productId && chat.productId?.toString() !== productId) {
//         const productMessage = new Message({
//           chatId: chat._id,
//           sender: senderId,
//           messageType: "product",
//           productId: productId,
//         });
//         await productMessage.save();
//         chat.productId = productId;
//         chat.lastMessage = productMessage._id;
//         await chat.save();
//       }
      
//       chat = await Chat.findById(chat._id)
//         .populate("participants", "userName")
//         .populate("productId");
//     } else {
//       // Create new chat and its first "Product" message
//       chat = new Chat({
//         participants: [senderId, receiverId],
//         productId: productId || null,
//       });
//       await chat.save();

//       if (productId) {
//         const productMessage = new Message({
//           chatId: chat._id,
//           sender: senderId,
//           messageType: "product",
//           productId: productId,
//         });
//         await productMessage.save();
//         chat.lastMessage = productMessage._id;
//         await chat.save();
//       }

//       chat = await Chat.findById(chat._id)
//         .populate("participants", "userName")
//         .populate("productId");
//     }

//     res.status(200).json(chat);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getChats = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const chats = await Chat.find({
//       participants: { $in: [userId] },
//     })
//       .populate("participants", "userName")
//       .populate("productId")
//       .populate("lastMessage")
//       .sort({ updatedAt: -1 });

//     res.status(200).json(chats);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getMessages = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const messages = await Message.find({ chatId })
//       .populate("sender", "userName")
//       .populate("productId")
//       .sort({ createdAt: 1 });

//     res.status(200).json(messages);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const updateChatQuantity = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const { quantity } = req.body;

//     const chat = await Chat.findByIdAndUpdate(
//       chatId,
//       { quantity },
//       { new: true }
//     ).populate("productId").populate("participants", "userName");

//     if (!chat) {
//       return res.status(404).json({ message: "Chat not found" });
//     }

//     res.status(200).json(chat);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
import { Chat } from "../model/chat.schema.js";
import { Message } from "../model/message.schema.js";
import {Product} from "../model/product.schema.js";

export const createChat = async (req, res) => {
  try {
    const { receiverId, productId } = req.body;
    
    // Safety check if user session disappeared
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Please log in to start a chat" });
    }
    const senderId = req.user.id;

    if (senderId === receiverId) {
      return res.status(400).json({ success: false, message: "You cannot chat with yourself" });
    }

    let chat = await Chat.findOne({
      participants: { $size: 2, $all: [senderId, receiverId] },
    });

    if (chat) {
      if (productId && chat.productId?.toString() !== productId) {
        const productMessage = new Message({
          chatId: chat._id,
          sender: senderId,
          messageType: "product",
          productId: productId,
        });
        await productMessage.save();
        chat.productId = productId;
        chat.lastMessage = productMessage._id;
        await chat.save();
      }
      
      chat = await Chat.findById(chat._id)
        .populate("participants", "userName")
        .populate("productId");
    } else {
      chat = new Chat({
        participants: [senderId, receiverId],
        productId: productId || null,
      });
      await chat.save();

      if (productId) {
        const productMessage = new Message({
          chatId: chat._id,
          sender: senderId,
          messageType: "product",
          productId: productId,
        });
        await productMessage.save();
        chat.lastMessage = productMessage._id;
        await chat.save();
      }

      chat = await Chat.findById(chat._id)
        .populate("participants", "userName")
        .populate("productId");
    }

    return res.status(200).json(chat);
  } catch (error) {
    console.error("❌ CREATE CHAT CONTROLLER ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getChats = async (req, res) => {
  try {
    // Prevent crash if user session is completely empty
    if (!req.user || !req.user.id) {
      console.log("⚠️ getChats requested but user is unauthenticated. Returning empty array.");
      return res.status(200).json([]); 
    }

    const userId = req.user.id;
    const chats = await Chat.find({
      participants: { $in: [userId] },
    })
      .populate("participants", "userName")
      .populate("productId")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    return res.status(200).json(chats || []);
  } catch (error) {
    console.error("❌ GET CHATS CONTROLLER ERROR:", error);
    // Return an empty array on error so frontend loading spinners turn off smoothly
    return res.status(500).json([]); 
  }
};

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId })
      .populate("sender", "userName")
      .populate("productId")
      .sort({ createdAt: 1 });

    return res.status(200).json(messages || []);
  } catch (error) {
    console.error("❌ GET MESSAGES CONTROLLER ERROR:", error);
    return res.status(500).json([]);
  }
};

export const updateChatQuantity = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { quantity } = req.body;

    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { quantity },
      { new: true }
    ).populate("productId").populate("participants", "userName");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    return res.status(200).json(chat);
  } catch (error) {
    console.error("❌ UPDATE CHAT QUANTITY ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const uploadChatImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }
    return res.status(200).json({ imageUrl: req.file.path });
  } catch (error) {
    console.error("❌ UPLOAD CHAT IMAGE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};