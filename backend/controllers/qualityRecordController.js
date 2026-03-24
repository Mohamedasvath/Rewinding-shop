import QualityRecord from "../models/QualityRecord.js";

/* ───────── PARSE STRING → OBJECT (safe) ───────── */
const parseIfString = (val) => {
  if (!val) return {};
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    try { return JSON.parse(val); } catch { return {}; }
  }
  return {};
};

/* ───────── FIX ALL NESTED OBJECTS ───────── */
const fixNested = (body) => {
  body.inspectionTesting = parseIfString(body.inspectionTesting);
  body.coreDetails       = parseIfString(body.coreDetails);
  body.conditionDetails  = parseIfString(body.conditionDetails);
  body.paperDetails      = parseIfString(body.paperDetails);
  body.windingDetails    = parseIfString(body.windingDetails);
  body.processDetails    = parseIfString(body.processDetails);
  body.assemblingTesting = parseIfString(body.assemblingTesting);
  body.efficiencyDetails = parseIfString(body.efficiencyDetails);
  if (body.assembledProof) {
    body.assembledProof  = parseIfString(body.assembledProof);
  }
  return body;
};

/* ───────── FIX DATE STRINGS → Date OBJECTS ───────── */
const fixDates = (data) => {
  const fields = ["date", "partyGPDate", "dNoteDate", "billDate"];
  fields.forEach((field) => {
    if (data[field]) {
      const parsed = new Date(data[field]);
      if (!isNaN(parsed)) {
        data[field] = parsed;
      } else {
        delete data[field];
      }
    } else {
      delete data[field];
    }
  });
  return data;
};

/* ───────── DEEP MERGE NESTED SECTIONS ───────── */
const deepMergeNested = (existing, incoming) => ({
  ...existing.toObject(),
  ...incoming,
  inspectionTesting: {
    ...(existing.inspectionTesting || {}),
    ...(incoming.inspectionTesting || {}),
  },
  coreDetails: {
    ...(existing.coreDetails        || {}),
    ...(incoming.coreDetails        || {}),
  },
  conditionDetails: {
    ...(existing.conditionDetails   || {}),
    ...(incoming.conditionDetails   || {}),
  },
  paperDetails: {
    ...(existing.paperDetails       || {}),
    ...(incoming.paperDetails       || {}),
  },
  windingDetails: {
    ...(existing.windingDetails     || {}),
    ...(incoming.windingDetails     || {}),
  },
  processDetails: {
    ...(existing.processDetails     || {}),
    ...(incoming.processDetails     || {}),
  },
  assemblingTesting: {
    ...(existing.assemblingTesting  || {}),
    ...(incoming.assemblingTesting  || {}),
  },
  efficiencyDetails: {
    ...(existing.efficiencyDetails  || {}),
    ...(incoming.efficiencyDetails  || {}),
  },
  assembledProof: {
    ...(existing.assembledProof     || {}),
    ...(incoming.assembledProof     || {}),
  },
});

/* ───────── CREATE ───────── */
/* ✅ new Model().save() பதிலா QualityRecord.create() use பண்றோம் */
export const createQualityRecord = async (req, res) => {
  try {
    let data = fixDates(fixNested({ ...req.body }));

    if (req.file) {
      data.assembledProof = {
        ...(data.assembledProof || {}),
        imageUrl: req.file.path,
      };
    }

    const record = await QualityRecord.create(data);
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ───────── GET ALL ───────── */
export const getAllQualityRecords = async (req, res) => {
  try {
    const records = await QualityRecord.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ───────── GET ONE ───────── */
export const getQualityRecordById = async (req, res) => {
  try {
    const record = await QualityRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Not found" });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ───────── UPDATE ───────── */
/* ✅ double res.json() bug fix — ஒரே ஒரு findByIdAndUpdate */
export const updateQualityRecord = async (req, res) => {
  try {
    let data = fixDates(fixNested({ ...req.body }));

    const existing = await QualityRecord.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Record not found" });

    if (req.file) {
      data.assembledProof = {
        ...(existing.assembledProof || {}),
        imageUrl: req.file.path,
      };
    }

    const mergedData = deepMergeNested(existing, data);

    const updated = await QualityRecord.findByIdAndUpdate(
      req.params.id,
      mergedData,
      { new: true, runValidators: false }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ───────── DELETE ───────── */
export const deleteQualityRecord = async (req, res) => {
  try {
    const record = await QualityRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });
    await record.deleteOne();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};