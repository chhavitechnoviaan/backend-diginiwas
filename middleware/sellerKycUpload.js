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
      let folder =
        "diginiwas/seller-kyc";

      // ================================
      // ID FRONT
      // ================================
      if (
        file.fieldname ===
        "idFront"
      ) {
        folder =
          "diginiwas/seller-kyc/front";
      }

      // ================================
      // ID BACK
      // ================================
      if (
        file.fieldname ===
        "idBack"
      ) {
        folder =
          "diginiwas/seller-kyc/back";
      }

      const cleanFileName =
        file.originalname
          .split(".")[0]
          .replace(
            /[^a-zA-Z0-9-_]/g,
            "-"
          )
          .replace(
            /-+/g,
            "-"
          );

      return {
        folder,

        resource_type:
          "image",

        allowed_formats: [
          "jpg",
          "jpeg",
          "png",
          "webp",
        ],

        public_id:
          `seller-${Date.now()}-${cleanFileName}`,
      };
    },
  });

const sellerKycUpload =
  multer({
    storage,

    limits: {
      fileSize:
        10 *
        1024 *
        1024,
    },

    fileFilter: (
      req,
      file,
      cb
    ) => {
      const allowedMimeTypes =
        [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ];

      if (
        !allowedMimeTypes.includes(
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

      cb(null, true);
    },
  });

export default sellerKycUpload;