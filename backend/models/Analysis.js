const mongoose = require("mongoose")

const AnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fileType: {
    type: String,
    enum: ["image", "video", "live"],
    required: true,
  },
  filePath: {
    type: String,
  },
  location: {
    type: String,
    required: true,
  },
  results: {
    type: Object,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Analysis", AnalysisSchema)

