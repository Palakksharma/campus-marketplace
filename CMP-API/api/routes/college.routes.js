import express from "express" ;
import { createCollege,getallColleges } from "../controllers/college.controller.js";
import { protect, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router()
router.post("/admin",protect, isAdmin , createCollege);
router.get("/get-colleges", getallColleges);
export default router;