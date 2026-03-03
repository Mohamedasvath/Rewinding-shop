import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  console.log("✅ Connected DB Name:", mongoose.connection.name);
};

export default connectDB;
