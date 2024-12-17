const oauth2Client = require("../config/googleAuth");
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const User = require("../Model/User");

//youtube login
const youtubeLogin = (req, res) => {
  const scopes = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
  res.json({ url: authUrl });
};

// YouTube Callback
const youtubeCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ error: "Missing required parameter: code" });
  }
  try {
    const { tokens } = await oauth2Client.getToken({
      code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URIS,
      grant_type: "authorization_code",
    });
    oauth2Client.setCredentials(tokens);

    // Fetch user email from Google People API
    const people = google.people({ version: "v1", auth: oauth2Client });
    const me = await people.people.get({
      resourceName: "people/me",
      personFields: "emailAddresses",
    });

    const email =
      me.data.emailAddresses && me.data.emailAddresses[0]
        ? me.data.emailAddresses[0].value
        : "Email not found";

    // Check if user exists in the database
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email });
    }
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const response = await youtube.channels.list({
      part: "snippet,contentDetails,statistics",
      mine: true,
    });

    const channelData = response.data.items[0];

    res.status(200).json({
      message: "YouTube login successful!",
      email,
      channelData,
      tokens,
      youtubeaccesstoken: jwtToken,
    });
  } catch (error) {
    console.error("Error during YouTube authentication:", error.message);
    res.status(500).json({
      error: "Authentication failed",
      message: error.message,
    });
  }
};

//get video user playlist

const getVideos = async (req, res) => {
  try {
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    if (!oauth2Client.credentials) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const playlistsResponse = await youtube.playlists.list({
      part: "snippet,contentDetails",
      mine: true,
      maxResults: 10,
    });

    const playlists = playlistsResponse.data.items;

    if (!playlists || playlists.length === 0) {
      return res.status(404).json({ error: error.message });
    }

    const playlistsWithVideosAndThumbnails = await Promise.all(
      playlists.map(async (playlist) => {
        const videosResponse = await youtube.playlistItems.list({
          part: "snippet,contentDetails",
          playlistId: playlist.id,
          maxResults: 10,
        });

        const videos = videosResponse.data.items.map((video) => ({
          videoId: video.contentDetails.videoId,
          title: video.snippet.title,
          timestamp: video.snippet.publishedAt,
          thumbnails: video.snippet.thumbnails,
        }));

        return {
          playlistId: playlist.id,
          playlistTitle: playlist.snippet.title,
          videos: videos,
        };
      })
    );

    res.status(200).json({
      message: "Playlists and videos fetched successfully",
      playlistsWithVideosAndThumbnails,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch playlists and videos",
      error: error.message,
    });
  }
};

module.exports = { youtubeLogin, youtubeCallback, getVideos };
