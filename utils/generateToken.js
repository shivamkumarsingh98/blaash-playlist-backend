const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    const secretKey = process.env.JWT_SECRET || "your-secret-key";
    return jwt.sign({ id: userId }, secretKey, { expiresIn: "1h" }); // Token valid for 1 hour
};

module.exports = generateToken;