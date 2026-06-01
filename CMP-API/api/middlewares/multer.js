import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../config/cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary,
    params:{
        folder: "campus-market-place",
        allowed_formats: ["jpeg", "jpg", "png", "webp", "avif"],
    },
});

const upload = multer({storage});
export default upload;