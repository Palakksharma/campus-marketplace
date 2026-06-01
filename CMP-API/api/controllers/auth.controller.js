

import { genToken } from "../../utils/genToken.js";
import { Auth } from "../model/auth.schema.js";
import { College } from "../model/college.schema.js";
import { Product } from "../model/product.schema.js";
import { Order } from "../model/order.schema.js"; 

export const signup = async (req, res, next) => {
    try {
        const { userName, email, password, college } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        const existingUser = await Auth.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        const newUser = await Auth.create({ 
            userName, 
            email, 
            password, 
            college, 
            isVerified: false, 
            role: "user" 
        });

        return res.status(201).json({
            id: newUser._id,
            message: "signup successful",
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};

export const signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        const user = await Auth.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User not found",
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({
                message: "password is incorrect",
            });
        }

        if (user.role !== "admin" && user.isVerified === false) {
            return res.status(400).json({
                message: "You can sign in once the admin has verified you."
            });
        }

        const token = await genToken(user._id, user.role, user.college ? user.college : null);
        if (!token) {
            return res.status(400).json({
                message: "token is not found",
            });
        }

        return res.status(200).cookie("token", token, {
            httpOnly: true,
            secure: false, // Set to true if using HTTPS
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .json({
            id: user._id,
            message: "signin successfully",
            user: {
                _id: user._id,
                userName: user.userName,
                email: user.email,
                role: user.role,
                college: user.college,
                isVerified: user.isVerified
            }
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await Auth.findById(req.user.id).select("-password").populate("college");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { userName } = req.body;
        const updatedUser = await Auth.findByIdAndUpdate(
            req.user.id,
            { $set: { userName } },
            { new: true }
        ).select("-password").populate("college");
        
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            data: updatedUser
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Get all users for a specific Dean's college
export const getAllUsers = async (req, res, next) => {
    try {
        const college = await College.findOne({ admin: req.user.id });
        if (!college) {
            return res.status(404).json({ message: "College not found for this admin" });
        }

        const users = await Auth.find({
            role: "user",
            college: college._id,
        }).select("-password");

        if (!users || users.length === 0) {
            return res.status(400).json({
                message: "No Users Found",
            });
        }
        return res.status(200).json({
            data: users,
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};

// Update user isVerified by admin
export const isVerifiedUser = async (req, res, next) => {
    try {
        const updated_user = await Auth.findByIdAndUpdate(
            req.params.id,
            { $set: { isVerified: true } },
            { new: true }
        );
        return res.json({
            message: "User verified successfully",
            data: updated_user
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};

// New Signout function to clear the cookie
export const signout = async (req, res, next) => {
    try {
        res.clearCookie("token").status(200).json({
            message: "Signout successful"
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};

// Get Admin Statistics
export const getAdminStats = async (req, res) => {
    try {
        const college = await College.findOne({ admin: req.user.id });
        if (!college) {
            return res.status(200).json({
                hasCollege: false,
                stats: {
                    totalUsers: 0,
                    unverifiedUsers: 0,
                    totalProducts: 0,
                    activeProducts: 0,
                    totalOrders: 0
                }
            });
        }

        const collegeId = college._id;

        // Total Students
        const totalUsers = await Auth.countDocuments({ role: "user", college: collegeId });
        
        // Unverified Students
        const unverifiedUsers = await Auth.countDocuments({ role: "user", college: collegeId, isVerified: false });
        
        // Total Products in college
        const totalProducts = await Product.countDocuments({ college: collegeId });
        
        // Active Products (in stock)
        const activeProducts = await Product.countDocuments({ college: collegeId, inStock: true });

        // Total Orders inside college
        const userIds = await Auth.find({ college: collegeId }).distinct("_id");
        const totalOrders = await Order.countDocuments({
            $or: [
                { sellerId: { $in: userIds } },
                { buyerId: { $in: userIds } }
            ]
        });

        return res.status(200).json({
            hasCollege: true,
            collegeName: college.collegeName,
            collegeAddress: college.address,
            stats: {
                totalUsers,
                unverifiedUsers,
                totalProducts,
                activeProducts,
                totalOrders
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};

// Delete student/user and all their listings by Admin
export const deleteUserByAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const college = await College.findOne({ admin: req.user.id });
        if (!college) {
            return res.status(404).json({ message: "College not found for this admin" });
        }

        // Find user and check if they belong to this college and are normal users
        const user = await Auth.findOne({ _id: id, college: college._id, role: "user" });
        if (!user) {
            return res.status(404).json({ message: "Student not found in your college" });
        }

        // Delete user's products
        await Product.deleteMany({ seller: id });

        // Delete the user
        await Auth.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Student and their listings deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};


