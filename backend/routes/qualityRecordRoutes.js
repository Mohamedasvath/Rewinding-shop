import express from "express";
import upload from "../middleware/upload.js";
import {
  createQualityRecord,
  getAllQualityRecords,
  getQualityRecordById,
  updateQualityRecord,
  deleteQualityRecord,
} from "../controllers/qualityRecordController.js";

const router = express.Router();

router.post("/", upload.single("assembledImage"), createQualityRecord);

router.get("/", getAllQualityRecords);
router.get("/:id", getQualityRecordById);
router.put("/:id", upload.single("assembledImage"), updateQualityRecord);
router.delete("/:id", deleteQualityRecord);

export default router;