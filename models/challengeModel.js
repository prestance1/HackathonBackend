const mongoose = require("mongoose");

const challengeSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("Challenge", challengeSchema);
