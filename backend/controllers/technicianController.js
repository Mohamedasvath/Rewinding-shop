import Technician from "../models/Technician.js";

/* GET ALL */
export const getTechnicians = async (req, res, next) => {
  try {
    const data = await Technician.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

/* ADD */
export const addTechnician = async (req, res) => {
  try {

    if (!req.body.name || req.body.name.trim() === "") {
      return res.status(400).json({ message: "Name is required" });
    }

    const exists = await Technician.findOne({ name: req.body.name });

    if (exists) {
      return res.status(400).json({ message: "Technician already exists" });
    }

    const tech = await Technician.create({
      name: req.body.name
    });

    res.status(201).json(tech);

  } catch (err) {
    console.error("Technician Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* DELETE */
export const deleteTechnician = async (req, res, next) => {
  try {
    await Technician.findByIdAndDelete(req.params.id);
    res.json({ message: "Technician deleted" });
  } catch (err) {
    next(err);
  }
};