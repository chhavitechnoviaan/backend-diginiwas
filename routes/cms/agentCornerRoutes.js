import express from "express";
import {
  getAgentCorner,
  updateAgentCorner,
} from "../../controllers/cms/agentCornerController.js";
import upload from "../../middleware/upload.js";

const router = express.Router();

router.get("/", getAgentCorner);

router.put("/", upload.single("image"), updateAgentCorner);

export default router;