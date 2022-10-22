const express = require("express");
const Challenge = require("../models/challengeModel");
const handler = require("express-async-handler");
const axios = require("axios");
const moment = require("moment");
const router = express.Router();

// @desc get daily challenge
// @route GET /api/challenge
// @access PUBLIC
router.get(
  "/challenge",
  handler(async (req, res) => {
    const currentDate = moment().toISOString();
    const challenge = (
      await Challenge.find({
        endDate: { $gt: currentDate },
      })
        .sort({ startDate: 1 })
        .limit(1)
    )[0];

    res.status(200).json({ challenge });
  })
);

router.post(
  "/challenge",
  handler(async (req, res) => {
    const { source, problemId } = req.body;

    let res1 = await axios.post(
      `https://${process.env.CUSTOMER_ID}.problems.sphere-engine.com/api/v4/submissions`,
      null,
      {
        params: {
          access_token: process.env.PROBLEMS_KEY,
          problemId,
          source,
          compilerId: 116,
        },
      }
    );
    const { id } = res1.data;

    let res2;
    await new Promise((resolve) => {
      const ting = setInterval(async () => {
        res = await axios.get(
          `https://${process.env.CUSTOMER_ID}.problems.sphere-engine.com/api/v4/submissions/${id}`,
          {
            params: {
              access_token: process.env.PROBLEMS_KEY,
            },
          }
        );
        const data = res2.data;
        if (!data.executing) {
          clearInterval(ting);
          resolve();
        }
      }, 2000);
    });

    if (res2.data.result.status.code === 15) {
      //smart contract shit
    }
  })
);

module.exports = router;
