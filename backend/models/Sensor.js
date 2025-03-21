const mongoose = require("mongoose")

const SensorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["crowd", "temperature", "humidity", "air-quality", "motion"],
    required: true,
  },
  status: {
    type: String,
    enum: ["online", "offline", "warning"],
    default: "online",
  },
  battery: {
    type: Number,
    min: 0,
    max: 100,
    default: 100,
  },
  data: {
    value: Number,
    unit: String,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Sensor", SensorSchema)

