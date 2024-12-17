const oauth2Client = require("../config/googleAuth");
const { google } = require("googleapis");
const User = require("../Model/User");
const jwt = require("jsonwebtoken");

// Google Login
const googleLogin = (req, res) => {
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
  res.json({ url: authUrl });
};

// Google Callback
const googleCallback = async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await oauth2Client.getToken({
      code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URIS,
      grant_type: "authorization_code",
    });

    oauth2Client.setCredentials(tokens);

    const people = google.people({ version: "v1", auth: oauth2Client });
    const me = await people.people.get({
      resourceName: "people/me",
      personFields: "emailAddresses",
    });

    const email =
      me.data.emailAddresses && me.data.emailAddresses[0]
        ? me.data.emailAddresses[0].value
        : null;

    if (!email) {
      return res
        .status(400)
        .json({ error: "Email not found in Google profile" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email });
    }
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.status(200).json({
      message: "Google login successful!",
      email,
      googleTokens: tokens,
      accesstoken: jwtToken,
    });
  } catch (error) {
    console.error("Google authentication error:", error.message);
    if (error.code === "invalid_grant") {
      return res.status(401).json({ error: "Invalid grant" });
    } else {
      return res.status(500).json({ error: "Authentication failed" });
    }
  }
};

module.exports = { googleLogin, googleCallback };
