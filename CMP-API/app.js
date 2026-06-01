import express from "express"
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import authRouter from "./api/routes/auth.routes.js";
import collegeRouter from "./api/routes/college.routes.js";
import productRouter from "./api/routes/product.route.js";
import wishlistRoutes from "./api/routes/wishlist.routes.js"; 
import chatRouter from "./api/routes/chat.routes.js";
import orderRouter from "./api/routes/order.routes.js";
import cookieParser from "cookie-parser";
dotenv.config();
 


const app = express();
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",")
    : ["http://localhost:5175", "http://localhost:5174", "http://localhost:5173"];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
//routes:
app.use("/api/auth", authRouter);
app.use("/api/college",collegeRouter);
app.use("/api/products", productRouter);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/chat", chatRouter);
app.use("/api/orders", orderRouter);

// Serve static frontend files from the compiled React build folder
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "../dist")));

// Wildcard route to handle frontend client-side routing
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.use((err, req, res, next) => {
    try {
        import("fs").then((fs) => {
            fs.writeFileSync("backend_error.log", `${new Date().toISOString()}\n${err.stack || err.message}\n`);
        }).catch((e) => console.error("Logger file write error:", e));
    } catch (e) {
        console.error("Logger error:", e);
    }
    console.error("Global Error Caught:", err);
    return res.status(500).json({
        message: err.message || "Something went wrong on the server"
    });
});

export default app;