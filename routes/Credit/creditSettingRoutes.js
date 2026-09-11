// import express from "express";

// import {
//   getCreditSettings,
//   updateCreditSettings,
//   updateCreditProduct,
//   resetCreditSettings,
// } from "../../controllers/Credit/creditSettingController.js";

// import {
//   protect,
// } from "../../middleware/authMiddleware.js";

// const router = express.Router();

// // Partner frontend ko prices dikhane ke
// // liye GET available rahega.
// router.get(
//   "/",
//   getCreditSettings
// );

// // ADMIN
// router.patch(
//   "/",
//   protect,
//   updateCreditSettings
// );

// router.patch(
//   "/product/:code",
//   protect,
//   updateCreditProduct
// );

// router.post(
//   "/reset",
//   protect,
//   resetCreditSettings
// );

// export default router;


import express from "express";
import { getCreditSettings, updateCreditSettings, updateCreditProduct, resetCreditSettings } from "../../controllers/Credit/creditSettingController.js";
import { protect } from "../../middleware/authMiddleware.js";
const router = express.Router();
router.get("/", getCreditSettings);
router.patch("/", protect, updateCreditSettings);
router.patch("/product/:code", protect, updateCreditProduct);
router.post("/reset", protect, resetCreditSettings);
export default router;
