const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const dbName = "myDb"
    const conn = await mongoose.connect(process.env.MONGO_URI, { dbName });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;
