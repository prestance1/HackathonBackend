const express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const PORT = process.env.PORT || 3002;

const challengesRouter = require("./routes/challenges");

connectDB();

var app = express();

app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", challengesRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
