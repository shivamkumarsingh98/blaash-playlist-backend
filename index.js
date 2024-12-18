const express = require("express");
const mongoose = require("mongoose");
const Mongodb = require("./config/Mongodb");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
dotenv.config();

app.use(express.json());

Mongodb();

// Routes
const AuthRoutes = require("./Routes/AuthRoutes");
app.use(cors());
app.use("/api", AuthRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

//deployment ment issue related code
app.use((req, res, next) => {
  if (req.url === "/favicon.ico") {
    res.status(204).end();
  } else {
    next();
  }
});
