import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (file.fieldname === "images") {
      return {
        folder: "properties/images",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      };
    }

    if (file.fieldname === "floorPlan" || file.fieldname === "reraCertificate") {
      return {
        folder: "properties/documents",
        resource_type: "raw",
        allowed_formats: ["pdf"],
      };
    }

    if (file.fieldname === "video") {
      return {
        folder: "properties/videos",
        resource_type: "video",
      };
    }

    return { folder: "properties/misc", resource_type: "auto" };
  },
});

const upload = multer({ storage });

export default upload;