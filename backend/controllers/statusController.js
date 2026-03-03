import Status from "../models/Status.js";

/* GET ALL */
export const getStatuses = async (req, res) => {
  try {
    const data = await Status.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    console.error("GET STATUS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ADD */
export const addStatus = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Status name is required" });
    }

    const exists = await Status.findOne({ name: name.trim() });

    if (exists) {
      return res.status(400).json({ message: "Status already exists" });
    }

    const status = await Status.create({
      name: name.trim()
    });

    res.status(201).json(status);

  } catch (err) {
    console.error("ADD STATUS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* DELETE */
export const deleteStatus = async (req, res) => {
  try {
    const deleted = await Status.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Status not found" });
    }

    res.json({ message: "Status deleted" });

  } catch (err) {
    console.error("DELETE STATUS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};