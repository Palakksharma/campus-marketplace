// import http from "http";
// import { Server } from "socket.io";
// import app from "./app.js";
// import { db } from "./config/db.js";
// import { setupSocket } from "./api/socket/socket.js";

// const port = process.env.PORT || 5000;

// // Create HTTP server
// const server = http.createServer(app);

// // Initialize Socket.io
// const io = new Server(server, {
//   cors: {
//     origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
//     credentials: true,
//   },
// });

// // Setup socket handlers
// setupSocket(io);

// // db
// db();

// // Start server
// server.listen(port, () => {
//   console.log(`localhost running at port ${port}`);
// });
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { db } from "./config/db.js";
import { setupSocket } from "./api/socket/socket.js";

const port = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

const socketAllowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",")
  : ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://localhost:5175"];

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: socketAllowedOrigins,
    credentials: true,
  },
});

// Setup socket handlers
setupSocket(io);

// Connect to Database and THEN start the server
const startServer = async () => {
  try {
    // Await the database connection
    await db();
    console.log("🚀 MongoDB Connected Successfully!");

    // Start the server only after a successful database connection
    server.listen(port, () => {
      console.log(`🚀 Server beautifully running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ DATABASE SELECTION/CONNECTION ERROR:", error.message);
    process.exit(1); // Stop the process cleanly if the database isn't working
  }
};

startServer();