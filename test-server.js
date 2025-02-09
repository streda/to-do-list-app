const mongoose = require("mongoose");
require("dotenv").config();
const dns = require("dns");

// Force MongoDB to resolve via IPv4
dns.setDefaultResultOrder("ipv4first");

const uri = process.env.MONGO_URI;

mongoose
  .connect(uri, {
    serverSelectionTimeoutMS: 5000, // Reduce timeout for faster errors
  })
  .then(() => {
    console.log("✅ Connected to MongoDB successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });