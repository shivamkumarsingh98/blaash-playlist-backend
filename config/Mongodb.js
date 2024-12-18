const mongoose = require("mongoose");

const connectMongoDb = async () => {
  try {
    const connect = await mongoose.connect(`${process.env.MONGO_URI}`);
    console.log(`DATABASE CONNECTED`);
  } catch (error) {
    console.log(`Error :${error.message}`);
  }
};

module.exports = connectMongoDb;
