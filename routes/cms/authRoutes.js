
import express from 'express';
import { login } from '../../controllers/cms/authController.js'; // .js extension lagana mat bhoolna

const router = express.Router();

router.post('/login', login);

export default router;