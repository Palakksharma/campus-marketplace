
import jwt from "jsonwebtoken";

//  PROTECT MIDDLEWARE
export const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const decoded = await jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        req.user = decoded;
        next();

    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};

//  ADMIN CHECK MIDDLEWARE (OUTSIDE)
export const isAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied",
            });
        }

        next(); 

    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};
export const isUser = async (req, res, next) => {
    try {
        // We check req.user (which was populated by the 'protect' middleware)
        if (req.user.role !== "user") { 
            return res.status(403).json({
                message: "Access denied. Only students/users can list products.",
            });
        }

        next(); 
    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};