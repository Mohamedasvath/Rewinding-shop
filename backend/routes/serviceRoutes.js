import express from "express";
import {
  createService,
  getAll,
  updateService,
  removeService,
  trackService,
  updateQualityRecords,
  createAdminMessage,
  markMessageSent,
  generateChallan
} from "../controllers/adminServiceController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* USER */
router.get("/track/:code", trackService);

/* ADMIN */
router.post("/", createService);
router.get("/", protect, getAll);
router.put("/:id", protect, updateService);
router.delete("/:id", protect, removeService);
router.put("/:id/quality", protect, updateQualityRecords);
router.post("/:id/message", protect, createAdminMessage);
router.put("/message/:msgId/sent", protect, markMessageSent);

/* DELIVERY CHALLAN */
router.get("/challan/:id", protect, generateChallan);

export default router;