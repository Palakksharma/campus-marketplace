import express from "express";
import { protect, isUser, isAdmin} from "../middlewares/auth.middleware.js";
import { createOrder, getMyOrders, getAdminOrders } from "../controllers/order.controller.js";

const router = express.Router();

// Sahi format:
router.post("/create", protect, isUser, createOrder);
router.get("/my-orders", protect, getMyOrders);

// Admin route
router.get("/admin/get-all", protect, isAdmin, getAdminOrders);

export default router;