import mongoose from "mongoose";

const motorDetailsSchema = new mongoose.Schema({
  make: String,
  hp: String,
  kw: String,
  volts: String,
  amps: String,
  phase: String,
  rpm: String,
  type: String,
  ins: String,
  frame: String,
  serialNumber: String,
  gatePassNumber: String
}, { _id: false });

const serviceSchema = new mongoose.Schema({
  /* MANUAL ENTRY */
  srfNumber: { type: String, required: true },
  trackingCode: { type: String, required: false },

  /* CUSTOMER */
  customerName: String,
  address: String,
  phone: String,
  gstNumber: String,

  /* MOTOR DETAILS - defined as separate schema to avoid casting issues */
  motorDetails: { type: motorDetailsSchema, default: () => ({}) },

  natureOfComplaint: String,
  sparesReceived: String,
  problemIdentity: String,

  /* DYNAMIC STATUS */
  stage: { type: String, default: "Received" },

  updatedDate: { type: Date, default: Date.now },

  technician: String,

  /* DELIVERY CHALLAN */
  deliveryChallan: {
    generated: { type: Boolean, default: false },
    challanNumber: String,
    date: Date,
    receiverName: String
  },

  completedAt: Date,
  lastUpdatedAt: Date

}, { timestamps: true });

// Force fresh model registration
delete mongoose.models["Service"];
export default mongoose.model("Service", serviceSchema);