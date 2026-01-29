const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Measurement = require("./models/Measurement");

const app = express();
const PORT = 3000;

// middlewares
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// test route
app.get("/", (req, res) => {
  res.send("API is running");
});

/**
 * GET time-series data
 */
app.get("/api/measurements", async (req, res) => {
  try {
    const { field, start_date, end_date } = req.query;

    if (!["field1", "field2", "field3"].includes(field)) {
      return res.status(400).json({ error: "Invalid field name" });
    }

    if (!start_date || !end_date) {
      return res.status(400).json({ error: "Start date and end date required" });
    }

    const start = new Date(start_date + "T00:00:00.000Z");
    const end = new Date(end_date + "T00:00:00.000Z");
    end.setUTCDate(end.getUTCDate() + 1);

    const data = await Measurement.find({
      timestamp: {
        $gte: start,
        $lt: end,
      },
    })
      .select({ timestamp: 1, [field]: 1, _id: 0 })
      .sort({ timestamp: 1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET metrics
 */
app.get("/api/measurements/metrics", async (req, res) => {
  try {
    const { field, start_date, end_date } = req.query;

    if (!["field1", "field2", "field3"].includes(field)) {
      return res.status(400).json({ error: "Invalid field name" });
    }

    const start = new Date(start_date + "T00:00:00.000Z");
    const end = new Date(end_date + "T00:00:00.000Z");
    end.setUTCDate(end.getUTCDate() + 1);

    const stats = await Measurement.aggregate([
      {
        $match: {
          timestamp: {
            $gte: start,
            $lt: end,
          },
        },
      },
      {
        $group: {
          _id: null,
          avg: { $avg: `$${field}` },
          min: { $min: `$${field}` },
          max: { $max: `$${field}` },
          stdDev: { $stdDevPop: `$${field}` },
        },
      },
    ]);

    res.json(
      stats[0] || { avg: 0, min: 0, max: 0, stdDev: 0 }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
