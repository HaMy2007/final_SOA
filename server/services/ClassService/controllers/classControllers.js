const Class = require("../models/Class");
const mongoose = require('mongoose');
const axios = require('axios');
const fs = require("fs");
const csv = require("csv-parser");

exports.getClassStudents = async (req, res) => {
  try {
    const classId = req.params.id;

    const classDoc = await Class.findOne({ class_id: classId });
    if (!classDoc) {
      return res.status(404).json({ message: `Không tìm thấy lớp với mã ${classId}` });
    }

    const studentIds = classDoc.class_member;
    if (!studentIds || studentIds.length === 0) {
      return res.status(200).json({
        class_id: classDoc.class_id,
        class_name: classDoc.class_name,
        students: []
      });
    }

    // Gọi sang UserService để lấy thông tin các user
    const response = await axios.post("http://localhost:4003/api/users/batch", {
      ids: studentIds,
    });

    res.status(200).json({
      class_id: classDoc.class_id,
      class_name: classDoc.class_name,
      students: response.data, // nên đảm bảo response.data là mảng user
    });
  } catch (error) {
    console.error("Lỗi khi lấy sinh viên lớp:", error.message);
    res.status(500).json({ message: "Lỗi server hoặc gọi user service thất bại" });
  }
};


exports.getAdvisorByClassId = async (req, res) => {
  try {
    const { classId } = req.params;

    const classDoc = await Class.findOne({ class_id: classId });
    if (!classDoc) {
      return res.status(404).json({ message: "Không tìm thấy lớp" });
    }

    const advisorId = classDoc.class_teacher;
    if (!advisorId) {
      return res.status(404).json({ message: "Lớp này chưa có cố vấn" });
    }

    const advisorRes = await axios.get(`http://localhost:4003/api/users/${advisorId}`);
    const advisor = advisorRes.data;

    res.status(200).json({
      advisor: {
        id: advisor._id,
        name: advisor.name,
        email: advisor.email,
        role: advisor.role,
        phone_number: advisor.phone_number,
        address: advisor.address,
      },
    });
  } catch (error) {
    console.error("[ClassService] Lỗi lấy thông tin cố vấn:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getClassesByTeacher = async (req, res) => {
    try {
        const teacherId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(400).json({ message: 'ID giáo viên không hợp lệ' });
        }

        const classDoc = await Class.findOne({ class_teacher: teacherId });
        if (!classDoc) {
          return res.status(404).json({ message: 'Không tìm thấy lớp của cố vấn' });
        }

        res.status(200).json({
            class: {
              class_id: classDoc.class_id,
              class_name: classDoc.class_name,
              // teacher_id: teacherId,
              // total: classes.length,
              // classes: classes,
            },
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách lớp của giáo viên:', error.message);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getClassByStudentId = async (req, res) => {
  try {
    const userId = req.params.id;

    const foundClass = await Class.findOne({ class_member: userId });
    if (!foundClass) {
      return res.status(404).json({ message: "Không tìm thấy lớp học của sinh viên này" });
    }

    res.status(200).json({ class: {
      class_id: foundClass.class_id,
      class_name: foundClass.class_name
    }});
  } catch (err) {
    console.error("Lỗi tìm lớp theo sinh viên:", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};


exports.getAdvisorOfStudent = async (req, res) => {
    try {
      const studentId = req.params.id;
  
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: 'ID sinh viên không hợp lệ' });
      }
  
      const classDoc = await Class.findOne({ class_member: studentId });
  
      if (!classDoc) {
        return res.status(404).json({ message: 'Không tìm thấy lớp chứa sinh viên này' });
      }
  
      const advisorId = classDoc.class_teacher;
  
      const advisorResponse = await axios.get(`http://localhost:4003/api/users/${advisorId}`);
      const advisor = advisorResponse.data;
  
      res.status(200).json({
        class: {
          id: classDoc.class_id,
          name: classDoc.class_name,
        },
        advisor: {
          id: advisor._id,
          name: advisor.name,
          email: advisor.email,
          role: Array.isArray(advisor.role) ? advisor.role[0] : advisor.role,
          phone_number: advisor.phone_number,
          address: advisor.address,
        },
      });
  
    } catch (error) {
      console.error('Lỗi khi lấy thông tin cố vấn:', error.message);
      res.status(500).json({ message: 'Lỗi server hoặc kết nối đến UserService thất bại' });
    }
};

exports.addClass = async (req, res) => {
    try {
      const { class_id, class_name, class_member, teacherId } = req.body;
  
      // Check thông tin cần thiết
      if (!class_id || !class_name || !teacherId) {
        return res.status(400).json({ message: 'Thiếu class_id, class_name hoặc teacherId' });
      }
  
      // Kiểm tra mã lớp trùng
      const existing = await Class.findOne({ class_id });
      if (existing) {
        return res.status(409).json({ message: 'Mã lớp đã tồn tại' });
      }
  
      const newClass = new Class({
        class_id,
        class_name,
        class_teacher: teacherId,
        class_member: class_member || []
      });
  
      await newClass.save();
  
      res.status(201).json({
        message: 'Thêm lớp thành công',
        class: newClass
      });
  
    } catch (err) {
      console.error('Lỗi khi thêm lớp:', err.message);
      res.status(500).json({ message: 'Lỗi server' });
    }
};
  
exports.getClassSizeById = async (req, res) => {
  try {
    const { class_id } = req.query;

    if (!class_id) {
      return res.status(400).json({ message: 'Thiếu class_id' });
    }

    // Tìm lớp theo class_id
    const classDoc = await Class.findOne({ class_id });

    if (!classDoc) {
      return res.status(404).json({ message: 'Không tìm thấy lớp với class_id đã cho' });
    }

    // Lấy sĩ số từ độ dài mảng class_member
    const totalStudents = classDoc.class_member.length;

    res.status(200).json({
      class_id: classDoc.class_id,
      class_name: classDoc.class_name,
      totalStudents
    });
  } catch (error) {
    console.error('[ClassService LỖI] [Lỗi lấy sĩ số lớp]:', error.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.importStudentsToClass = async (req, res) => {
  try {
    const { classId } = req.params;
    if (!req.file) return res.status(400).json({ message: 'Vui lòng tải lên file CSV' });

    const emails = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        if (row.email) emails.push(row.email.trim());
      })
      .on("end", async () => {
        if (emails.length === 0) return res.status(400).json({ message: "File không có email nào" });

        // Gửi sang UserService để lấy danh sách _id
        const userRes = await axios.post("http://localhost:4003/api/users/get-ids-by-emails", {
          emails
        });

        const userIds = userRes.data.userIds;
        if (!Array.isArray(userIds) || userIds.length === 0)
          return res.status(400).json({ message: "Không tìm thấy sinh viên nào từ danh sách email" });

        const updatedClass = await Class.findOneAndUpdate(
          { class_id: classId }, // tìm theo class_id thay vì _id
          { $addToSet: { class_member: { $each: userIds } } },
          { new: true }
        );        

        res.status(200).json({
          message: `Đã thêm ${userIds.length} sinh viên vào lớp`,
          updatedClass
        });
      });
  } catch (error) {
    console.error("[Import Students ERROR]", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};