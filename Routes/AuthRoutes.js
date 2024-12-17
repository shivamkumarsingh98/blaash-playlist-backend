const express = require("express");
const router = express.Router();
const { verify, signup } = require("../controller/Emailauthcontroller");
const {
  googleLogin,
  googleCallback,
} = require("../controller/Googleauthcontroller");

const {
  youtubeLogin,
  youtubeCallback,
  getVideos,
} = require("../controller/Youtubeauthcontroller");

const { saveLayout, loadLayout } = require("../controller/Layoutcontroller");
const { verifyjwt } = require("../Middleware/protected");

//routes

// Authentication and login routes
router.post("/signup", signup);
router.post("/verify", verify);
router.get("/googleLogin", googleLogin);
router.get("/googleCallback", googleCallback);
router.get("/youtubeLogin", youtubeLogin);
router.get("/youtubeCallback", youtubeCallback);

// YouTube-related route
router.get("/getvideos", getVideos);

// Layout-related routes
router.post("/saveLayout", verifyjwt, saveLayout); // Save layout with JWT protection
router.get("/loadLayout", verifyjwt, loadLayout);
module.exports = router;
