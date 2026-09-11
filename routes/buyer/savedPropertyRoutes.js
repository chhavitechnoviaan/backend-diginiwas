import express from "express";
import {
  saveProperty,
  getBuyerSavedProperties,
  checkSavedProperty,
  removeSavedProperty,
} from "../../controllers/Buyer/savedPropertyController.js";

const router = express.Router();

router.post("/", saveProperty);
router.get("/buyer/:buyerId", getBuyerSavedProperties);
router.get("/check/:buyerId/:propertyId", checkSavedProperty);
router.delete("/:buyerId/:propertyId", removeSavedProperty);

export default router;
