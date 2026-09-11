import express from "express";
import upload from "../../middleware/upload.js";

import {
  saveHeroSection,
  getHeroSection,
  deleteHeroImage,
} from "../../controllers/cms/heroSectionController.js";

const router = express.Router();

router.post(
  "/",
  upload.fields([
    {
      name: "heroImage1",
      maxCount: 1,
    },
    {
      name: "heroImage2",
      maxCount: 1,
    },
    {
      name: "heroImage3",
      maxCount: 1,
    },
  ]),
  saveHeroSection
);

router.get("/", getHeroSection);

router.delete("/image", deleteHeroImage);

export default router;