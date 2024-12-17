const { google } = require("googleapis");
require("dotenv").config();

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID, // Google Client ID
  process.env.CLIENT_SECRET, // Google Client Secret
  process.env.REDIRECT_URIS // Redirect URI (set in Google Cloud Console)
  
);

module.exports = oauth2Client;
