const express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const connectDB = require("./config/db");
require("dotenv").config();

const PORT = process.env.PORT || 3002;

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const challengesRouter = require("./routes/challenges");

connectDB();

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api", challengesRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
