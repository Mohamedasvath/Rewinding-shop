import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  particulars: {
    type: String,
    trim: true,
  },
  quantity: {
    type: String,
    trim: true,
  },
  remarks: {
    type: String,
    trim: true,
  },
});

const dChallanSchema = new mongoose.Schema({
  challanNumber: {
    type: Number,
    required: true,
    unique: true, // 🔥 important
  },

  date: {
    type: Date,
    default: Date.now,
  },

  to: {
    type: String,
    trim: true,
  },

  thru: {
    type: String,
    trim: true,
  },

  workOrderNumber: {
    type: String,
    trim: true,
  },

  gatePassNumber: {
    type: String,
    trim: true,
  },

  items: {
    type: [itemSchema],
    default: [],
  },

  receivedBy: {
    type: String,
    trim: true,
  },

}, { timestamps: true });

export default mongoose.model("DChallan", dChallanSchema);
