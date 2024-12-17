const jwt = require("jsonwebtoken"); // JWT library ko import karo

const verifyjwt = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Authorization header se token nikalo

  if (!token) {
    return res.status(401).json({ message: "Token nahi mila" }); // Agar token nahi hai to error bhejo
  }

  // JWT token ko verify karo
  jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
    if (err) {
      return res
        .status(401)
        .json({ message: "Authorization failed", error: err.message }); // Agar token galat ho to error bhejo
    }

    req.user = decodedToken; 
    next(); 
  });
};

module.exports = { verifyjwt };
