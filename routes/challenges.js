const express = require("express");
const Challenge = require("../models/challengeModel");
const handler = require("express-async-handler");
const axios = require("axios");
const router = express.Router();

// @desc get daily challenge
// @route GET /api/challenge
// @access PUBLIC
router.get(
  "/challenge",
  handler(async (req, res) => {
    const challenge = (
      await Challenge.find().sort({ startDate: -1 }).limit(1)
    )[0];

    res.status(200).json({ challenge });
  })
);

router.post(
  "/challenge",
  handler(async (req, res) => {
    const { source, problemId } = req.body;

    const res = await axios.post(
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
    const { id } = res.data;

		let res;
		await (new Promise((resolve) => {
			const ting = setInterval(() => {
				res = await axios.get(`https://${process.env.CUSTOMER_ID}.problems.sphere-engine.com/api/v4/submissions/${id}`,
				{
					params: {
						access_token: process.env.PROBLEMS_KEY
					}
				}
				)
				const data = res.data;
				if (!data.executing) {
					clearInterval(ting);
					resolve();
				}
			}, 2000);
		}));

		if (res.data.result.status.code === 15) {
			//smart contract shit
		}
  })
);

module.exports = router;
