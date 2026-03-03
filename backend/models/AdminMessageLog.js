import mongoose from "mongoose";

const schema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true
  },

  message: String,

  sent: {
    type: Boolean,
    default: false
  },

  sentAt: Date

},{ timestamps:true });

export default mongoose.model("AdminMessageLog", schema);
