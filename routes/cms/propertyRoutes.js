import express from "express";

import upload from "../../middleware/upload.js";

import {
  addProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  changePropertyStatus,
  searchProperties,
  filterProperties,
  propertyDashboard,
  getAllPropertiesbyfilter
} from "../../controllers/cms/propertyController.js";

const propertyUpload = upload.fields([
  { name: "images", maxCount: 20 },
  { name: "floorPlan", maxCount: 1 },
  { name: "reraCertificate", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

const router = express.Router();

router.post(
  "/",
  propertyUpload,  
  addProperty
);

router.get("/", getAllProperties);

router.get("/filter", getAllPropertiesbyfilter);
router.get("/:id", getPropertyById);

router.put(
  "/:id",
  propertyUpload,  
  updateProperty
);

router.delete("/:id", deleteProperty);
router.patch("/:id/status", changePropertyStatus);
router.get("/search/list", searchProperties);
router.get("/filter/list", filterProperties);
router.get("/dashboard/stats", propertyDashboard);

export default router;