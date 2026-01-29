const mongoose = require("mongoose");

const measurementSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true
  },
  field1: Number,
  field2: Number,
  field3: Number
});


module.exports = mongoose.model(
  "Measurement",
  measurementSchema,
  "measurements"
);
