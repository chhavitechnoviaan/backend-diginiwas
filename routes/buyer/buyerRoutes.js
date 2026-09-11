import express from 'express';
import { getAllBuyers, getBuyerById, getBuyerDashboard } from '../../controllers/Buyer/buyer.js';

const router = express.Router();

// Route: Get all buyers
router.get('/', getAllBuyers);
router.get("/:id/dashboard", getBuyerDashboard);
router.get('/:id', getBuyerById);

export default router;