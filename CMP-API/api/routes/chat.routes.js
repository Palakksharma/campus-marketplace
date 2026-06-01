import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { createChat, getChats, getMessages, updateChatQuantity, uploadChatImage } from "../controllers/chat.controller.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post("/create", protect, createChat);
router.get("/all", protect, getChats);
router.get("/messages/:chatId", protect, getMessages);
router.patch("/update-quantity/:chatId", protect, updateChatQuantity);
router.post("/upload-image", protect, upload.single("image"), uploadChatImage);

export default router;