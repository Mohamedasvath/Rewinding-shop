import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";

//


import technicianRoutes from "./routes/technicianRoutes.js";
import statusRoutes from "./routes/statusRoutes.js";
import qualityRecordRoutes from "./routes/qualityRecordRoutes.js";



dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/service", serviceRoutes);
app.use("/api/admin/auth", adminAuthRoutes);

//new routes 


app.use("/api/technicians", technicianRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/quality-record", qualityRecordRoutes);


app.get("/", (req, res) => {
  res.send("API Running ✅");
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
