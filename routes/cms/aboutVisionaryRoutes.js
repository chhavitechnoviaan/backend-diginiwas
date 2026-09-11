import express from "express";

import upload from "../../middleware/upload.js";

import {

getVisionaries,

updateVisionaryHeader,

addVisionary,

updateVisionary,

deleteVisionary,

} from "../../controllers/cms/aboutVisionaryController.js";

const router=express.Router();

router.get("/",getVisionaries);

router.put("/header",updateVisionaryHeader);

router.post(

"/member",

upload.single("image"),

addVisionary

);

router.put(

"/member/:id",

upload.single("image"),

updateVisionary

);

router.delete(

"/member/:id",

deleteVisionary

);

export default router;