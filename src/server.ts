
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(cors({
  origin: frontendUrl,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "BizFlow backend is running",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 BizFlow backend running on http://localhost:${PORT}`);
});