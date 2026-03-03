import express from "express";
import {
  getStatuses,
  addStatus,
  deleteStatus
} from "../controllers/statusController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* Get all statuses */
router.get("/", protect, getStatuses);

/* Add status */
router.post("/", protect, addStatus);

/* Delete status */
router.delete("/:id", protect, deleteStatus);

export default router;