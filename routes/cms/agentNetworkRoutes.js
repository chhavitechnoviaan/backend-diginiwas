import express from "express";

import upload from "../../middleware/upload.js";

import {

getAgentNetwork,

updateHeading,

addCard,

updateCard,

deleteCard,

} from "../../controllers/cms/agentNetworkController.js";

const router = express.Router();

router.get("/", getAgentNetwork);

router.put("/heading", updateHeading);

router.post(

"/card",

upload.single("image"),

addCard

);

router.put(

"/card/:id",

upload.single("image"),

updateCard

);

router.delete(

"/card/:id",

deleteCard

);

export default router;