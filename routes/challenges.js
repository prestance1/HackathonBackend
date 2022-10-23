const express = require("express");
const Challenge = require("../models/challengeModel");
const handler = require("express-async-handler");
const axios = require("axios");
const moment = require("moment");
const router = express.Router();
import { ethers, Wallet } from "ethers";
import Challenge from "../contracts/Challenge.json";
import ChallengeFactory from "../contracts/ChallengeFactory.json";

router.get("/admin/seed", async (req, res) => {
  const problems = await axios.get(
    `https://${process.env.CUSTOMER_ID}.problems.sphere-engine.com/api/v4/submissions/problems`,
    {
      params: {
        access_token: process.env.PROBLEMS_KEY,
      },
    }
  );
  await Challenge.deleteMany({});
});

router.post("/admin/fastForward", async (req, res) => {
  const { hours } = req.body;
  const dates = await Challenge.find({});

  console.log(dates);

  const newDates = dates.map((date) => {
    return {
      title: date.title,
      description: date.description,
      startDate: moment(date.startDate).subtract(hours, "hours").toISOString(),
      endDate: moment(date.endDate).subtract(hours, "hours").toISOString(),
      address: date.address,
      participants: date.participants,
      solved: date.solved,
    };
  });

  console.log(newDates);

  await Challenge.deleteMany({});
  await Challenge.insertMany(newDates);
});

router.get("/challenge", async (req, res) => {
  const currentDate = moment().toISOString();
  const challenge = (
    await Challenge.find({ endDate: { $gt: currentDate } })
      .sort({ startDate: 1 })
      .limit(1)
  )[0];

  res.status(200).send({
    ...challenge,
    isActive:
      challenge === null ? moment(challenge.startDate).isBefore() : false,
  });
});

// Create new challenge
router.post("/challenge", async (req, res) => {
  const body = req.body;
  console.log(body.startDate, body.endDate);
  const challenge = {
    title: body.title,
    description: body.description,
    startDate: moment(body.startDate).toISOString(),
    endDate: moment(body.endDate).toISOString(),
    address: body.address,
    participants: body.participants || [],
    solved: false,
  };

  // TODO -- check for overlaps

  if (
    moment(body.startDate).isBefore(moment()) ||
    moment(body.endDate).isBefore(moment(body.startDate))
  ) {
    return res.status(400).send("Invalid start or end date");
  }

  const query = await Challenge.findOne({
    startDate: { $lt: challenge.endDate },
    endDate: { $gt: challenge.startDate },
  });

  if (query) {
    return res
      .status(400)
      .send("Cannot create challenges with overlapping dates");
  }

  // Create Problem with Master Judge ID 1000
  // Create some test cases with Judge ID 1

  const makeProblem = await axios.post(
    `https://${process.env.CUSTOMER_ID}.problems.sphere-engine.com/api/v4/problems`,
    null,
    {
      params: {
        access_token: process.env.PROBLEMS_KEY,
        name: challenge.title,
        masterjudgeId: 1000,
      },
    }
  );

  const problemId = makeProblem.data.id;
  challenge.problemId = problemId;

  const testCases = req.body.testCases;
  for (const tc of testCases) {
    await axios.post(
      `https://${process.env.CUSTOMER_ID}.problems.sphere-engine.com/api/v4/problems/${problemId}/testcases`,
      null,
      {
        params: {
          access_token: process.env.PROBLEMS_KEY,
          name: "test",
          judgeId: 1,
          input: tc.input,
          output: tc.output,
        },
      }
    );
  }

  try {
    await Challenge.create(challenge);
    console.log("Successfully created challenge in DB");
  } catch (e) {
    console.log("ERROR creating challenge in DB");
    return res.status(500).send(e);
  }

  res.status(200).send(challenge);
});

// Add a participant
router.post("/challenge/:id/participants", async (req, res) => {});

router.post("/challenge/submissions", async (req, res) => {
  const { source, problemId } = req.body;
  let makeSubmission = await axios.post(
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
  const { id } = makeSubmission.data;

  let submissionUpdate;
  await new Promise((resolve) => {
    const interval = setInterval(async () => {
      submissionUpdate = await axios.get(
        `https://${process.env.CUSTOMER_ID}.problems.sphere-engine.com/api/v4/submissions/${id}`,
        {
          params: {
            access_token: process.env.PROBLEMS_KEY,
          },
        }
      );

      const data = submissionUpdate.data;
      if (!data.executing) {
        clearInterval(interval);
        resolve();
      }
    }, 500);
  });

  if (submissionUpdate.data.result.status.code === 15) {
    try {
      await setCandidateWinner();
    } catch (err) {
      return res.status(500).send("Error");
    }
  }

  res.status(200).json(submissionUpdate.data.result);
});

const setCandidateWinner = async (address) => {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.POLYGON_RPC_URL
  );
  const wallet = new Wallet(process.env.PRIVATE_KEY);
  const connectedWallet = wallet.connect(provider);
  //ask db for address of given challenge, or client maybe sends address of it
  const challenge = new ethers.Contract(
    CHALLENGE_ADDRESS,
    Challenge.abi,
    connectedWallet
  );
  try {
    const tx = await challenge.setWinner(address);
    console.log("waiting for tx ");
    const receipt = await tx.wait();
    // send success here
  } catch {
    console.log(err);
  }
};

module.exports = router;
