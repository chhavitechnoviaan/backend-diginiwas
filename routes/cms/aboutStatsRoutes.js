import express from "express";

import {

getAboutStats,

updateAboutStats,

} from "../../controllers/cms/aboutStatsController.js";

const router=express.Router();

router.get("/",getAboutStats);

router.put("/",updateAboutStats);

export default router;