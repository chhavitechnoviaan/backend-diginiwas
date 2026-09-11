import express from "express";

import {

getAboutGenesis,

updateAboutGenesis,

deleteAboutGenesisImage,

} from "../../controllers/cms/aboutGenesisController.js";

import upload from "../../middleware/upload.js";

const router=express.Router();

router.get("/",getAboutGenesis);

router.put(

"/",

upload.single("image"),

updateAboutGenesis

);

router.delete(

"/image",

deleteAboutGenesisImage

);

export default router;