
import express from "express";
import {
  createProduct,
  getAllProducts,
  getMyListing,
  markAsSold,
  updateProduct,
  deleteProduct,
  getProductById,
  getAdminProducts,
  deleteProductByAdmin,
} from "../controllers/product.controller.js";
import upload from "../middlewares/multer.js";
import { isUser, protect, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/create",
  protect,
  isUser,
  upload.array("image", 5),
  createProduct,
);
router.get("/get-all", getAllProducts);
router.get("/get-myListing", protect, isUser, getMyListing);
router.get("/get/:id", getProductById);
router.patch("/mark-as-sold/:id", protect, isUser, markAsSold);
console.log("Route Hit hua!");
router.put(
  "/update/:id",
  protect,
  isUser,
  upload.array("image", 5),
  updateProduct,
);
router.delete("/delete/:id", protect, isUser, deleteProduct);

// Admin moderation routes
router.get("/admin/get-all", protect, isAdmin, getAdminProducts);
router.delete("/admin/delete/:id", protect, isAdmin, deleteProductByAdmin);

export default router;
