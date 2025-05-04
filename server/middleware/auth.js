const jwt = require("jsonwebtoken");
require('dotenv').config();

exports.authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Không có token" });

  jwt.verify(token, process.env.JWT_SECRET || "secret_key", (err, user) => {
    if (err) {
      console.log("Lỗi verify token:", err.message);
      return res.sendStatus(403);
    }

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

exports.allowStudentAndAdvisorOnlyAndOwner = (req, res, next) => {
  const { role, id } = req.user;
  const { author_id } = req.body;

  if ((role === 'advisor' || role === 'student') && author_id === id) {
    return next();
  }

  return res.status(403).json({ message: 'Chỉ cố vấn, sinh viên và đúng người đăng mới được phép' });
};

