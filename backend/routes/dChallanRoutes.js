import express from "express";
import {
  createChallan,
  getAllChallans,
  getChallanById,
  updateChallan,
  deleteChallan,
} from "../controllers/dChallanController.js";

const router = express.Router();

/* ───────── ROUTES ───────── */

// CREATE
router.post("/", createChallan);

// GET ALL
router.get("/", getAllChallans);

// GET SINGLE
router.get("/:id", getChallanById);

// UPDATE
router.put("/:id", updateChallan);

// DELETE
router.delete("/:id", deleteChallan);

export default router;