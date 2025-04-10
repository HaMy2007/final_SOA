const User = require('../models/User');
const LoginInfo = require('../models/LoginInfo');
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const bcrypt = require('bcrypt');

exports.getUsersByIds = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: 'Danh sách ids không hợp lệ' });
        }

        const users = await User.find({ _id: { $in: ids }, role: 'student' });
        res.status(200).json(users);

    } catch (error) {
        console.error('Lỗi truy vấn sinh viên:', error.message);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
      const userId = req.params.id;
  
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
      }
  
      // Chỉ cho phép update các trường này:
      const allowedFields = ['phone_number', 'parent_number', 'address'];
      const updateData = {};
  
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
  
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'Không có trường hợp lệ để cập nhật' });
      }
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }
  
      res.status(200).json({
        message: 'Cập nhật thông tin thành công',
        user: updatedUser
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật user:', error.message);
      res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getUserById = async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server khi lấy user' });
    }
};

exports.getUserByTdtId = async (req, res) => {
  try {
    const user = await User.findOne({ tdt_id: req.params.tdt_id });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error('[ERROR] Lấy user theo tdt_id:', err.message);
    res.status(500).json({ message: 'Lỗi server khi lấy người dùng' });
  }
};

exports.getUserIdsByEmails = async (req, res) => {
  try {
    const { emails } = req.body;
    if (!Array.isArray(emails)) return res.status(400).json({ message: "Danh sách emails không hợp lệ" });

    const users = await User.find({ email: { $in: emails } }, "_id");
    const userIds = users.map(u => u._id);

    res.status(200).json({ userIds });
  } catch (error) {
    console.error("[Get User IDs ERROR]", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.importUsersFromFile = async (req, res) => {
  try {
    const { class_id } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file CSV hoặc XLSX' });
    }

    const filePath = req.file.path;
    const ext = req.file.originalname.split('.').pop();
    let users = [];

    if (ext === 'csv') {
      const rows = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', row => rows.push(row))
        .on('end', async () => {
          await insertUsers(rows, res);
        });
    } else if (ext === 'xlsx') {
      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      users = xlsx.utils.sheet_to_json(sheet);
      await insertUsers(users, res);
    } else {
      return res.status(400).json({ message: 'Định dạng file không hợp lệ (chỉ hỗ trợ csv hoặc xlsx)' });
    }
  } catch (err) {
    console.error('[Import Users ERROR]', err.message);
    res.status(500).json({ message: 'Lỗi server khi import' });
  }
};

exports.importAdvisors = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Vui lòng tải lên file CSV hoặc XLSX" });

    const ext = req.file.originalname.split(".").pop().toLowerCase();
    let data = [];

    if (ext === "csv") {
      const rows = [];
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (row) => rows.push(row))
        .on("end", async () => {
          console.log("[DEBUG] Đọc CSV xong:", rows.length, "dòng");
          await insertUsers(rows, res);
        });
    } else if (ext === "xlsx") {
      const workbook = xlsx.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      data = xlsx.utils.sheet_to_json(sheet);
      console.log("[DEBUG] Đọc XLSX xong:", data.length, "dòng");
      await insertUsers(data, res);
    } else {
      return res.status(400).json({ message: "Định dạng file không hợp lệ (chỉ .csv hoặc .xlsx)" });
    }
  } catch (err) {
    console.error("[Import Users ERROR]", err.message);
    res.status(500).json({ message: "Lỗi server khi import users" });
  }
};

async function insertUsers(users, res) {
  const inserted = [];

  for (const u of users) {
    const {
      email,
      address,
      name,
      role,
      tdt_id,
      gender,
      phone_number,
      date_of_birth
    } = u;

    if (!email || !name || !tdt_id || !gender || !phone_number || !date_of_birth) {
      console.log("[BỎ QUA]", u);
      continue;
    }

    const exists = await User.findOne({ $or: [{ email }, { tdt_id }] });
    if (exists) {
      console.log("[ĐÃ TỒN TẠI]", email);
      continue;
    }

    const trimmedRole = (role || 'student').trim().toLowerCase();

    const newUser = new User({
      email: email.trim(),
      address: address?.trim() || "",
      name: name.trim(),
      role: [trimmedRole],
      tdt_id: tdt_id.trim(),
      gender: gender.trim(),
      phone_number: phone_number.trim(),
      date_of_birth: new Date(date_of_birth)
    });

    const savedUser = await newUser.save();

    if (['student', 'advisor'].includes(trimmedRole)) {
      const existedLogin = await LoginInfo.findOne({ username: tdt_id.trim() });
      if (!existedLogin) {
        try {
          const hashedPassword = await bcrypt.hash(tdt_id.trim(), 10);
          const loginInfo = new LoginInfo({
            user_id: savedUser._id,
            username: tdt_id.trim(),
            password: hashedPassword
          });
          await loginInfo.save();
        } catch (e) {
          console.error('[UserService LỖI] [LỖI tạo loginInfo]', tdt_id, e.message);
        }
      } else {
        console.log(`[SKIP] loginInfo đã tồn tại: ${tdt_id}`);
      }
    }

    inserted.push(savedUser);
  }

  res.status(200).json({ message: `Đã thêm ${inserted.length} người dùng`, inserted });
}

