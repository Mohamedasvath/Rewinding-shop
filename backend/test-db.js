import mongoose from "mongoose";
import "dotenv/config";

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
  gatePassNumber: String,
  gatePassDate: Date
}, { _id: false });

const serviceSchema = new mongoose.Schema({
  srfNumber: { type: String, required: true },
  trackingCode: { type: String, required: false },
  motorDetails: { type: motorDetailsSchema, default: () => ({}) },
}, { timestamps: true });

const Service = mongoose.model("Service", serviceSchema, "services");

async function run() {
  await mongoose.connect("mongodb+srv://srwshop41:srw1234@cluster0.liur6vj.mongodb.net/rewinding_shop?retryWrites=true&w=majority");
  console.log("Connected to MongoDB.");
  
  const latestService = await Service.findOne().sort({ createdAt: -1 });
  console.log("Latest Service:", JSON.stringify(latestService, null, 2));
  
  process.exit();
}
run();
