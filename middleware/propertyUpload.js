import multer from "multer";

import {
  CloudinaryStorage,
} from "multer-storage-cloudinary";

import cloudinary from "../config/cloudinary.js";


const storage =
  new CloudinaryStorage({
    cloudinary,

    params: async (
      req,
      file
    ) => {
      // ==========================================
      // PROPERTY IMAGES
      // ==========================================

      if (
        file.fieldname ===
        "images"
      ) {
        return {
          folder:
            "diginiwas/properties/images",

          resource_type:
            "image",

          allowed_formats: [
            "jpg",
            "jpeg",
            "png",
            "webp",
          ],

          public_id:
            `property-${Date.now()}-${Math.round(
              Math.random() *
                1e9
            )}`,
        };
      }


      // ==========================================
      // VIDEO
      // ==========================================

      if (
        file.fieldname ===
        "video"
      ) {
        return {
          folder:
            "diginiwas/properties/videos",

          resource_type:
            "video",

          public_id:
            `video-${Date.now()}-${Math.round(
              Math.random() *
                1e9
            )}`,
        };
      }


      // ==========================================
      // FLOOR PLAN / RERA
      // ==========================================

      return {
        folder:
          "diginiwas/properties/documents",

        resource_type:
          "raw",

        public_id:
          `document-${Date.now()}-${Math.round(
            Math.random() *
              1e9
          )}`,
      };
    },
  });


const fileFilter = (
  req,
  file,
  cb
) => {
  // ------------------------------------------
  // Images
  // ------------------------------------------

  if (
    file.fieldname ===
    "images"
  ) {
    const allowed =
      [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

    if (
      !allowed.includes(
        file.mimetype
      )
    ) {
      return cb(
        new Error(
          "Only JPG, JPEG, PNG and WEBP images are allowed."
        ),
        false
      );
    }
  }


  // ------------------------------------------
  // PDFs
  // ------------------------------------------

  if (
    file.fieldname ===
      "floorPlan" ||
    file.fieldname ===
      "reraCertificate"
  ) {
    if (
      file.mimetype !==
      "application/pdf"
    ) {
      return cb(
        new Error(
          "Floor Plan and RERA Certificate must be PDF files."
        ),
        false
      );
    }
  }


  // ------------------------------------------
  // Video
  // ------------------------------------------

  if (
    file.fieldname ===
    "video"
  ) {
    const allowedVideos =
      [
        "video/mp4",
        "video/webm",
        "video/quicktime",
      ];

    if (
      !allowedVideos.includes(
        file.mimetype
      )
    ) {
      return cb(
        new Error(
          "Only MP4, WEBM and MOV video files are allowed."
        ),
        false
      );
    }
  }

  cb(null, true);
};


const upload =
  multer({
    storage,

    fileFilter,

    limits: {
      fileSize:
        25 *
        1024 *
        1024,
    },
  });


export default upload;