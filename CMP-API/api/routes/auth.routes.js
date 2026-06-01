import express from "express";

import { getAllUsers,signin,signup,getUser, signout,isVerifiedUser, getAdminStats, deleteUserByAdmin, updateProfile} from "../controllers/auth.controller.js";
import {protect, isAdmin} from "../middlewares/auth.middleware.js";

const router  = express.Router()

//http methods
router.post("/signup", signup)
router.post("/signin", signin)
router.get("/get-user", protect , getUser)
router.put("/update-profile", protect, updateProfile)
router.post("/signout", signout)

router.get("/admin/get-users" , protect, isAdmin , getAllUsers);
router.post("/admin/verify-user/:id" , protect, isAdmin, isVerifiedUser) //jo bhi dyn val front se a rhi hai vo id se catch ho gi
router.get("/admin/stats", protect, isAdmin, getAdminStats);
router.delete("/admin/delete-user/:id", protect, isAdmin, deleteUserByAdmin);
export default router;