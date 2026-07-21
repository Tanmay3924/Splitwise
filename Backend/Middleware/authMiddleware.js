const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  const decode = jwt.verify(token, process.env.JWT_SECRET);
  req.userId = decode.userId;
  next();
};

module.exports = authMiddleware;
