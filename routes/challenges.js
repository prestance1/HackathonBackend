const express = require("express");
const router = express.Router();

var challenge = {
  title: "TwoSum",
  description: "desc",
  startDate: "",
  endDate: "",
};

// @desc get daily challenge
// @route GET /api/challenge
// @access PUBLIC
router.get("/challenge", (req, res) => {
  res.status(200).json({ challenge });
});

module.exports = router;
