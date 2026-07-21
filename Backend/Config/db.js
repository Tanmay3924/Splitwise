const mongoose = require("mongoose");
const env = require("dotenv");
env.config();
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/SplitWise";
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB error");
    process.exit(1);
  }
}
module.exports = connectDB;
