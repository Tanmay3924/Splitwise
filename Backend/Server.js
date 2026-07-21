const env = require("dotenv");
env.config();
const express = require("express");

const authRoutes = require("./Routes/authRoutes");
const roomRoutes = require("./Routes/roomRoutes");
const profileRoute = require("./Routes/profileRoute");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const url = process.env.BACKEND_URL || "http://localhost:5000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const connectDB = require("./Config/db");
app.use(express.json());
connectDB();
app.use(
  cors({
    origin: [
      "https://split-wise-backend-vvqj.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api", roomRoutes);
app.use("/api", profileRoute);
app.get("/", (req, res) => {
  res.send("Welcome to the SplitWise API");
});
app.listen(url.split(":").pop(), () => {
  console.log(`Server is running ${url}`);
});
