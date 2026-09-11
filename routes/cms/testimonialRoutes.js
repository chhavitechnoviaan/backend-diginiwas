import express from "express";
import upload from "../../middleware/upload.js";

import {
  createTestimonial,
  getTestimonials,
  getSingleTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../../controllers/cms/testimonialController.js";

const router = express.Router();

/* ===========================
   Create
=========================== */

router.post(
  "/",
  upload.single("image"),
  createTestimonial
);

/* ===========================
   Get All
=========================== */

router.get(
  "/",
  getTestimonials
);

/* ===========================
   Get Single
=========================== */

router.get(
  "/:id",
  getSingleTestimonial
);

/* ===========================
   Update
=========================== */

router.put(
  "/:id",
  upload.single("image"),
  updateTestimonial
);

/* ===========================
   Delete
=========================== */

router.delete(
  "/:id",
  deleteTestimonial
);

export default router;