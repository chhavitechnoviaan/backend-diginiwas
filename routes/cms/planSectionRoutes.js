import express from "express";

import {

getPlanSection,

updatePlanSection,

} from "../../controllers/cms/planSectionController.js";

const router = express.Router();

router.get("/", getPlanSection);

router.put("/", updatePlanSection);

export default router;