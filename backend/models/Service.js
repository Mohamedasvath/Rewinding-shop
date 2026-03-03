import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
{
  /* MANUAL ENTRY */
  srfNumber: {
    type: String,
    required: true
  },

  trackingCode: {
    type: String,
    required: false
  },

  /* CUSTOMER */
  customerName: String,
  address: String,
  phone: String,
  gstNumber: String,

  /* MOTOR DETAILS */
  motorDetails: {
    make: String,
    hp: String,
    rpm: String,
    serialNumber: String,
    gatePassNumber: String
  },

  problemIdentity: String,

  /* DYNAMIC STATUS */
  stage: {
    type: String,
    default: "Received"
  },
  
  updatedDate: {
  type: Date,
  default: Date.now
},

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

},
{ timestamps: true }
);

export default mongoose.model("Service", serviceSchema);