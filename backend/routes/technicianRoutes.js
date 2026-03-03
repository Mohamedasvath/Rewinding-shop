import express from "express";
import {
  getTechnicians,
  addTechnician,
  deleteTechnician
} from "../controllers/technicianController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* Get all technicians */
router.get("/", protect, getTechnicians);

/* Add technician */
router.post("/", protect, addTechnician);

/* Delete technician */
router.delete("/:id", protect, deleteTechnician);

export default router;