const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const LoginInfo = require('../models/LoginInfo');
const User = require('../models/User');

const { JWT_SECRET } = process.env;

exports.login = async (req, res) => {
    const { tdt_id, password } = req.body;
  
    try {
      // Tìm thông tin đăng nhập bằng tdt_id
      const loginInfo = await LoginInfo.findOne({ tdt_id });
      if (!loginInfo) {
        return res.status(400).json({ message: 'Tài khoản không tồn tại!' });
      }
  
      // So sánh mật khẩu
      const isMatch = await bcrypt.compare(password, loginInfo.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Sai mật khẩu!' });
      }
  
      // Lấy thông tin người dùng
      const user = await User.findById(loginInfo.user_id);
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
      }
  
      // Tạo JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      // Trả về token và thông tin user
      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          tdt_id: user.tdt_id,
          email: user.email,
          role: user.role
        }
      });
  
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      res.status(500).json({ message: 'Lỗi máy chủ!' });
    }
  };
