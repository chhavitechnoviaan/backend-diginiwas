import express from "express";
import upload from "../../middleware/upload.js";

import {
  saveRoundSection,
  getRoundSection,
  deleteRoundImage,
} from "../../controllers/cms/roundSectionController.js";

const router = express.Router();

router.post(
  "/",
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
    { name: "image5", maxCount: 1 },
  ]),
  saveRoundSection
);

router.get("/", getRoundSection);

router.delete("/image", deleteRoundImage);

export default router;