import Service from "../models/Service.js";
import AdminMessageLog from "../models/AdminMessageLog.js";
import PDFDocument from "pdfkit";

/* =========================================================
   CREATE SERVICE (ADMIN ONLY - MANUAL SRF & TRACKING)
========================================================= */
export const createService = async (req, res, next) => {
  try {

   const {
  srfNumber,
  trackingCode,
  customerName,
  address,
  phone,
  gstNumber,
  technician,
  stage,
  date,
  natureOfComplaint,
  sparesReceived,
  motorDetails,
  problem
} = req.body;
    /* BASIC VALIDATION */
    if (!srfNumber || !trackingCode) {
      return res.status(400).json({
        message: "SRF Number and Tracking Code are required"
      });
    }

    /* SAFE PARSE — handles cases where motorDetails arrives as a JSON string
       (e.g. multipart/form-data or incorrect Content-Type from client)        */
    let parsedMotorDetails = motorDetails;
    if (typeof motorDetails === "string") {
      try {
        parsedMotorDetails = JSON.parse(motorDetails);
      } catch {
        parsedMotorDetails = {};
      }
    }

    const service = await Service.create({
      srfNumber,
     trackingCode: trackingCode.trim().toUpperCase(),
      customerName,
      address,
      phone,
      gstNumber,

     motorDetails: {
  make: parsedMotorDetails?.make,
  hp: parsedMotorDetails?.hp,
  kw: parsedMotorDetails?.kw,
  volts: parsedMotorDetails?.volts,
  amps: parsedMotorDetails?.amps,
  phase: parsedMotorDetails?.phase,
  rpm: parsedMotorDetails?.rpm,
  type: parsedMotorDetails?.type,
  ins: parsedMotorDetails?.ins,
  frame: parsedMotorDetails?.frame,
  serialNumber: parsedMotorDetails?.serialNumber,
  gatePassNumber: parsedMotorDetails?.gatePassNumber
},

      problemIdentity: problem,
      natureOfComplaint: natureOfComplaint || "",
      sparesReceived: sparesReceived || "",
      stage: stage || "Received",
      technician: technician || "",

      updatedDate: date || new Date(),  // ✅ THIS IS THE FIX
      lastUpdatedAt: new Date()
    });

    res.status(201).json(service);

  } catch (err) {
    next(err);
  }
};
/* =========================================================
   USER TRACK (MULTIPLE MOTORS SUPPORT)
========================================================= */

export const trackService = async (req, res) => {
  try {
    const searchCode = req.params.code?.trim();

    console.log("Searching for code:", searchCode);

    if (!searchCode) {
      return res.status(400).json({
        success: false,
        message: "Tracking code is required",
      });
    }

    const service = await Service.findOne({
      trackingCode: { $regex: `^${searchCode}$`, $options: "i" }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    // 🔥 IMPORTANT
    return res.status(200).json({
      success: true,
      data: service,
    });

  } catch (err) {
    console.error("Backend Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
/* =========================================================
   ADMIN GET ALL
========================================================= */
export const getAll = async (req, res, next) => {
  try {
    const data = await Service.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   ADMIN UPDATE
========================================================= */
export const updateService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found"
      });
    }

    /* UPDATE BASIC FIELDS */
    service.customerName = req.body.customerName ?? service.customerName;
    service.address = req.body.address ?? service.address;
    service.phone = req.body.phone ?? service.phone;
    service.gstNumber = req.body.gstNumber ?? service.gstNumber;
    /* UPDATE IDENTIFIERS */
    service.srfNumber = req.body.srfNumber ?? service.srfNumber;
    service.trackingCode = req.body.trackingCode ?? service.trackingCode;

    service.problemIdentity = req.body.problem ?? service.problemIdentity;
    service.technician = req.body.technician ?? service.technician;
    service.natureOfComplaint = req.body.natureOfComplaint ?? service.natureOfComplaint;
    service.sparesReceived = req.body.sparesReceived ?? service.sparesReceived;

    /* UPDATE MOTOR DETAILS SAFELY - handle full motorDetails object from frontend */
    if (req.body.motorDetails && typeof req.body.motorDetails === "object") {
      const md = req.body.motorDetails;
      service.motorDetails.make          = md.make          ?? service.motorDetails.make;
      service.motorDetails.hp            = md.hp            ?? service.motorDetails.hp;
      service.motorDetails.kw            = md.kw            ?? service.motorDetails.kw;
      service.motorDetails.volts         = md.volts         ?? service.motorDetails.volts;
      service.motorDetails.amps          = md.amps          ?? service.motorDetails.amps;
      service.motorDetails.phase         = md.phase         ?? service.motorDetails.phase;
      service.motorDetails.rpm           = md.rpm           ?? service.motorDetails.rpm;
      service.motorDetails.type          = md.type          ?? service.motorDetails.type;
      service.motorDetails.ins           = md.ins           ?? service.motorDetails.ins;
      service.motorDetails.frame         = md.frame         ?? service.motorDetails.frame;
      service.motorDetails.serialNumber  = md.serialNumber  ?? service.motorDetails.serialNumber;
      service.motorDetails.gatePassNumber= md.gatePassNumber?? service.motorDetails.gatePassNumber;
    } else {
      if (req.body.make !== undefined) service.motorDetails.make = req.body.make;
      if (req.body.hp   !== undefined) service.motorDetails.hp   = req.body.hp;
      if (req.body.rpm  !== undefined) service.motorDetails.rpm  = req.body.rpm;
      if (req.body.serialNumber   !== undefined) service.motorDetails.serialNumber   = req.body.serialNumber;
      if (req.body.gatePassNumber !== undefined) service.motorDetails.gatePassNumber = req.body.gatePassNumber;
    }

    if (req.body.date !== undefined) {
  service.updatedDate = req.body.date;
}

    /* STATUS UPDATE */
    if (req.body.stage) {
      service.stage = req.body.stage;

      if (req.body.stage === "Completed") {
        service.completedAt = new Date();

        service.deliveryChallan = {
          generated: true,
          challanNumber: `DC-${service.srfNumber}`,
          date: new Date()
        };
      }
    }

    service.lastUpdatedAt = new Date();

    const updated = await service.save();

    res.json(updated);

  } catch (err) {
    next(err);
  }
};

/* =========================================================
   DELETE SERVICE
========================================================= */
export const removeService = async (req, res, next) => {
  try {
    const deleted = await Service.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Service not found"
      });
    }

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    next(err);
  }
};

/* =========================================================
   UPDATE QUALITY RECORDS
========================================================= */
export const updateQualityRecords = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found"
      });
    }

    service.qualityRecords = req.body;
    await service.save();

    res.json(service.qualityRecords);

  } catch (err) {
    next(err);
  }
};

/* =========================================================
   CREATE ADMIN MESSAGE LOG
========================================================= */
export const createAdminMessage = async (req, res, next) => {
  try {
    const log = await AdminMessageLog.create({
      serviceId: req.params.id,
      message: req.body.message
    });

    res.status(201).json(log);

  } catch (err) {
    next(err);
  }
};

/* =========================================================
   MARK MESSAGE AS SENT
========================================================= */
export const markMessageSent = async (req, res, next) => {
  try {
    const log = await AdminMessageLog.findById(req.params.msgId);

    if (!log) {
      return res.status(404).json({
        message: "Message log not found"
      });
    }

    log.sent = true;
    log.sentAt = new Date();

    await log.save();

    res.json(log);

  } catch (err) {
    next(err);
  }
};


/* GENERATE DELIVERY CHALLAN */
export const generateChallan = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service)
      return res.status(404).json({ message: "Service not found" });

    const doc = new PDFDocument({ size: "A4", margin: 40 });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=DeliveryChallan-${service.srfNumber}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    /* HEADER */
    doc.fontSize(18).text("SENTHIL REWINDING WORKS", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text("DELIVERY CHALLAN", { align: "center", underline: true });
    doc.moveDown(2);

    doc.fontSize(11);

    /* BASIC INFO */
    doc.text(`Challan No: DC-${service.srfNumber}`);
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`);
    doc.moveDown();

    doc.text(`Work Order No: ${service.srfNumber}`);
    doc.text(`Customer Name: ${service.customerName}`);
    doc.text(`Phone: ${service.phone}`);
    doc.text(`Address: ${service.address || "-"}`);
    doc.moveDown();

    /* MOTOR DETAILS */
    doc.text(`Motor Make: ${service.motorDetails?.make || "-"}`);
    doc.text(`HP: ${service.motorDetails?.hp || "-"}`);
    doc.text(`RPM: ${service.motorDetails?.rpm || "-"}`);
    doc.text(`Serial Number: ${service.motorDetails?.serialNumber || "-"}`);
    doc.text(`Gate Pass Number: ${service.motorDetails?.gatePassNumber || "-"}`);
    doc.moveDown(2);

    /* RECEIVER */
    doc.text(`Receiver Name: ${service.deliveryChallan?.receiverName || "____________________"}`);
    doc.moveDown();
    doc.text("Receiver Signature: ____________________");
    doc.moveDown(2);

    doc.text("Authorized Signature", { align: "right" });

    doc.end();

  } catch (err) {
    next(err);
  }
};