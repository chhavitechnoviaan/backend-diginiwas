import multer from "multer";
import {
  CloudinaryStorage,
} from "multer-storage-cloudinary";

import cloudinary from "./cloudinary.js";


const storage =
  new CloudinaryStorage({
    cloudinary,

    params: async (
      req,
      file
    ) => {
      let folder =
        "diginiwas/properties";

      let resourceType =
        "image";

      // ==========================================
      // VIDEO
      // ==========================================

      if (
        file.fieldname ===
        "video"
      ) {
        folder =
          "diginiwas/properties/videos";

        resourceType =
          "video";
      }

      // ==========================================
      // PDF / DOCUMENTS
      // ==========================================

      if (
        file.fieldname ===
          "floorPlan" ||
        file.fieldname ===
          "reraCertificate"
      ) {
        folder =
          "diginiwas/properties/documents";

        resourceType =
          "raw";
      }

      return {
        folder,

        resource_type:
          resourceType,

        allowed_formats:
          file.fieldname ===
          "images"
            ? [
                "jpg",
                "jpeg",
                "png",
                "webp",
              ]
            : undefined,

        public_id:
          `${Date.now()}-${file.originalname
            .split(".")[0]
            .replace(
              /\s+/g,
              "-"
            )}`,
      };
    },
  });


const upload =
  multer({
    storage,

    limits: {
      fileSize:
        20 *
        1024 *
        1024,
    },
  });


export default upload;