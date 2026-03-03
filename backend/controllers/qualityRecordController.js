import QualityRecord from "../models/QualityRecord.js";

// CREATE
export const createQualityRecord = async (req, res) => {
  try {

    const data = req.body;

    if (req.file) {
      data.assembledProof = {
        imageUrl: req.file.path,
      };
    }

    const record = await QualityRecord.create(data);

    res.status(201).json(record);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL
export const getAllQualityRecords = async (req, res) => {
  try {
    const records = await QualityRecord.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ONE
export const getQualityRecordById = async (req, res) => {
  try {
    const record = await QualityRecord.findById(req.params.id)
      .populate("serviceId");

    if (!record) return res.status(404).json({ message: "Not found" });

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
export const updateQualityRecord = async (req, res) => {
  try {

    const data = req.body;

    if (req.file) {
      data.assembledProof = {
        imageUrl: req.file.path,
      };
    }

    const updated = await QualityRecord.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
export const deleteQualityRecord = async (req, res) => {
  try {
    await QualityRecord.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};