import express from "express";

import {
  getPlatformFeatures,
  savePlatformFeatures,
} from "../../controllers/cms/platformFeatureController.js";

const router = express.Router();

router.get("/cms/platform-features", getPlatformFeatures);
router.post("/cms/platform-features", savePlatformFeatures);

export default router;