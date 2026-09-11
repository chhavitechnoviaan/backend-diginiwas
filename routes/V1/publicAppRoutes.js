import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getHomeFeed,
  getDashboardHeader,
  getPropertyCategories,
  getBoostedProperties,
  getNewListings,
  getPopularLocations,
  getNearbyAgents,
} from "../../controllers/V1/homeController.js";
import { exploreNearby } from "../../controllers/V1/nearbyController.js";

const router = express.Router();

router.get("/home/feed", protect, getHomeFeed);
router.get("/user/dashboard-header", protect, getDashboardHeader);
router.get("/properties/categories", protect, getPropertyCategories);
router.get("/properties/boosted", protect, getBoostedProperties);
router.get("/properties/explore-nearby", protect, exploreNearby);
router.get("/properties/new-listings", protect, getNewListings);
router.get("/locations/popular", protect, getPopularLocations);
router.get("/agents/nearby", protect, getNearbyAgents);

export default router;
