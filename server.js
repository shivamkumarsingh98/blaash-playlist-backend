const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config({ path: "./.env" });
const app = express();
const port = 4000;

// Middleware to parse JSON request body
app.use(express.json());
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

//routes
const AuthRoutes = require("./Routes/AuthRoutes");
app.use(cors({ origin: "http://localhost:5173" }));
app.use("/api", AuthRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
