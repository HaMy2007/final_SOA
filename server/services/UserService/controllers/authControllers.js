const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const LoginInfo = require('../models/LoginInfo');
const User = require('../models/User');
require('dotenv').config();

const { JWT_SECRET } = process.env;

exports.login = async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const loginInfo = await LoginInfo.findOne({ username });
      if (!loginInfo) {
        return res.status(400).json({ message: 'Tài khoản không tồn tại' });
      }
  
      const isMatch = await bcrypt.compare(password, loginInfo.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Sai mật khẩu' });
      }
  
      const user = await User.findById(loginInfo.user_id);
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }
  
      const token = jwt.sign(
        { id: user._id, role: user.role, tdt_id: user.tdt_id, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      res.status(200).json({
        token,
        user: {
          id: user._id,
          tdt_id: user.tdt_id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('[LOGIN ERROR]', error.message);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  };
