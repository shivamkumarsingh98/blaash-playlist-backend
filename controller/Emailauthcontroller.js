const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../Model/User");
const jwt = require("jsonwebtoken");

const otpStore = {};

// Step 1: Send OTP

const signup = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const otp = crypto.randomInt(1000, 9999).toString();

  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Blaash.io" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Step 2: Verify OTP
const verify = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }
  const storedOtp = otpStore[email];
  if (!storedOtp) {
    return res.status(400).json({ message: "OTP not found or expired" });
  }
  if (storedOtp.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }
  if (Date.now() > storedOtp.expires) {
    return res.status(400).json({ message: "OTP has expired" });
  }

  try {
    delete otpStore[email];
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        isVerified: true,
      });
      await user.save();
    } else {
      user.isVerified = true;
      await user.save();
    }
    const accestoken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).json({
      message: "OTP verified successfully. Signup complete!",
      accestoken,
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  verify,
  signup,
};
