import DChallan from "../models/DChallan.js";

/* ───────── CREATE ───────── */
export const createChallan = async (req, res) => {
  try {
    const { challanNumber } = req.body;

    // ❗ duplicate check
    const existing = await DChallan.findOne({ challanNumber });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Challan number already exists ⚠️",
      });
    }

    const challan = await DChallan.create(req.body);

    res.status(201).json({
      success: true,
      message: "Challan created successfully",
      data: challan,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ───────── GET ALL ───────── */
export const getAllChallans = async (req, res) => {
  try {
    const challans = await DChallan.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: challans.length,
      data: challans,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ───────── GET ONE ───────── */
export const getChallanById = async (req, res) => {
  try {
    const challan = await DChallan.findById(req.params.id);

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    res.status(200).json({
      success: true,
      data: challan,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ───────── UPDATE ───────── */
export const updateChallan = async (req, res) => {
  try {
    const { challanNumber } = req.body;

    // ❗ duplicate check (exclude current)
    const existing = await DChallan.findOne({
      challanNumber,
      _id: { $ne: req.params.id },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Challan number already exists ⚠️",
      });
    }

    const challan = await DChallan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Challan updated successfully",
      data: challan,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ───────── DELETE ───────── */
export const deleteChallan = async (req, res) => {
  try {
    const challan = await DChallan.findByIdAndDelete(req.params.id);

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};