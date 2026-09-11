import express from "express";

import {
  getNetworkDensity,
  updateNetworkDensity,
} from "../../controllers/cms/networkDensityController.js";

const router = express.Router();

router.get("/", getNetworkDensity);

router.put("/", updateNetworkDensity);

export default router;