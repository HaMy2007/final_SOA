const jwt = require("jsonwebtoken");

exports.authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Không có token" });

  jwt.verify(token, process.env.JWT_SECRET || "secret_key", (err, user) => {
    if (err) return res.sendStatus(403); 

    req.user = user;
    next();
  });
};


exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.user; 

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    next(); 
  };
};
