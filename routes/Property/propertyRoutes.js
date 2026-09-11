// import express from "express";

// import {
//   createProperty,
//    getAdminProperties,
//   getAdminPropertyById,
//   updatePropertyStatus,
//   boostProperty,
//   removePropertyBoost,
//   getPropertiesByPartner,
// } from "../../controllers/Property/propertyController.js";

// import {
//   protect,
// } from "../../middleware/authMiddleware.js";

// const router =
//   express.Router();

// router.post("/",createProperty);
// router.get("/admin", getAdminProperties);
// router.get("/partner/:partnerId",getPropertiesByPartner);
// router.get("/:id", getAdminPropertyById);
// router.patch("/:id/status",updatePropertyStatus);
// router.patch("/:id/boost",boostProperty);
// router.patch("/:id/unboost",removePropertyBoost);

// export default router;

import express from "express";

import {
  createProperty,
  getAdminProperties,
  getAdminPropertyById,
  updatePropertyStatus,
  boostProperty,
  removePropertyBoost,
  getPropertiesByPartner,
  updateProperty,
  getAllProperties,
  deleteProperty,
  getFilteredLiveProperties
} from "../../controllers/Property/propertyController.js";

import {
  protect,
} from "../../middleware/authMiddleware.js";

import upload from "../../middleware/propertyUpload.js";

const router = express.Router();

// Public website listing. This route only returns Live + Verified properties.
router.get(
  "/",
  getFilteredLiveProperties
);

// ======================================================
// CREATE PROPERTY
// Images + Floor Plan + RERA + Video
// ======================================================

router.post(
  "/",

  upload.fields([
    {
      name: "images",
      maxCount: 25,
    },

    {
      name: "floorPlan",
      maxCount: 1,
    },

    {
      name: "reraCertificate",
      maxCount: 1,
    },

    {
      name: "video",
      maxCount: 1,
    },
  ]),

  createProperty
);

router.get(
  "/all",
  getAllProperties
);

// ======================================================
// ADMIN PROPERTIES
// ======================================================

router.get(
  "/admin",
  getAdminProperties
);

router.get(
  "/filter",
  getFilteredLiveProperties
);

// ======================================================
// PARTNER PROPERTIES
// IMPORTANT: Keep this before /:id
// ======================================================

router.get(
  "/partner/:partnerId",
  getPropertiesByPartner
);


// ======================================================
// UPDATE PROPERTY
// ======================================================

router.patch(
  "/:id",

  upload.fields([
    {
      name: "images",
      maxCount: 25,
    },

    {
      name: "floorPlan",
      maxCount: 1,
    },

    {
      name: "reraCertificate",
      maxCount: 1,
    },

    {
      name: "video",
      maxCount: 1,
    },
  ]),

  updateProperty
);


// ======================================================
// STATUS
// ======================================================

router.patch(
  "/:id/status",
  protect,
  updatePropertyStatus
);


// ======================================================
// BOOST
// ======================================================

router.patch(
  "/:id/boost",
  protect,
  boostProperty
);


// ======================================================
// UNBOOST
// ======================================================

router.patch(
  "/:id/unboost",
  protect,
  removePropertyBoost
);


// ======================================================
// GET PROPERTY BY ID
// IMPORTANT: Dynamic /:id should remain near bottom
// ======================================================

router.get(
  "/:id",
  getAdminPropertyById
);
router.delete(
  "/:id/delete",
  protect,
  deleteProperty
);

export default router;
