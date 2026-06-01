import {Order}  from "../model/order.schema.js";
import  {Product}  from "../model/product.schema.js";
import { College } from "../model/college.schema.js";
import { Auth } from "../model/auth.schema.js";

export const createOrder = async (req, res) => {
  try {
    const { productId, buyerId, sellerId, quantity } = req.body;

    if (!productId || !buyerId || !sellerId || !quantity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient quantity available" });
    }

    // Update product quantity
    product.quantity -= quantity;
    if (product.quantity <= 0) {
      product.inStock = false;
    }
    await product.save();

    const order = await Order.create({
      productId,
      buyerId,
      sellerId,
      quantity,
    });

    res.status(201).json({
      message: "Order generated successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    // Get orders where the user is either buyer or seller
    const orders = await Order.find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
    })
      .populate("productId")
      .populate("buyerId", "userName email")
      .populate("sellerId", "userName email")
      .sort({ createdAt: -1 });

    res.status(200).json({ data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders in admin's college
export const getAdminOrders = async (req, res) => {
  try {
    const college = await College.findOne({ admin: req.user.id });
    if (!college) {
      return res.status(404).json({ message: "College not found for this admin" });
    }

    // Find all users inside this college
    const userIds = await Auth.find({ college: college._id }).distinct("_id");

    // Fetch orders involving any of these users (as buyer or seller)
    const orders = await Order.find({
      $or: [
        { buyerId: { $in: userIds } },
        { sellerId: { $in: userIds } }
      ]
    })
      .populate("productId")
      .populate("buyerId", "userName email")
      .populate("sellerId", "userName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ data: orders });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};