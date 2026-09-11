// import express from "express";

// import {
//   getBoostOperationsDashboard,
//   getBoostRequestById,
// } from "../../controllers/Promotion/boostDashboardController.js";

// const router = express.Router();

// router.get(
//   "/dashboard",
//   getBoostOperationsDashboard
// );

// router.get(
//   "/:id",
//   getBoostRequestById
// );

// export default router;

import express from "express";
import {
  getBoostOperationsDashboard,
  getBoostRequestById,
} from "../../controllers/Promotion/boostDashboardController.js";

const router = express.Router();
router.get("/dashboard", getBoostOperationsDashboard);
router.get("/:id", getBoostRequestById);
export default router;
