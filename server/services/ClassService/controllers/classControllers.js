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
              students: classDoc.class_member
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

exports.removeAdvisorFromClass = async (req, res) => {
  const updated = await Class.findByIdAndUpdate(
    req.params.classId,
    { $unset: { class_teacher: "" } },
    { new: true }
  );
  res.json({ message: "Đã gỡ cố vấn khỏi lớp", class: updated });
};

exports.getClassByTeacherId = async (req, res) => {
  const classFound = await Class.findOne({ class_teacher: req.params.teacherId });
  if (!classFound) return res.status(404).json({ message: "Không tìm thấy lớp có cố vấn này" });
  res.json(classFound);
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
          role: advisor.role,
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

        const targetClass = await Class.findOne({ class_id: classId });
        if (!targetClass) {
          return res.status(404).json({ message: "Không tìm thấy lớp học" });
        }

        const existingIds = new Set((targetClass.class_member || []).map(id => id.toString()));
        const alreadyInClass = [];
        const toAdd = [];

        userIds.forEach((id, i) => {
          if (existingIds.has(id)) {
            alreadyInClass.push(emails[i]);
          } else {
            toAdd.push(id);
          }
        });

        const updatedClass = await Class.findOneAndUpdate(
          { class_id: classId }, // tìm theo class_id thay vì _id
          { $addToSet: { class_member: { $each: userIds } } },
          { new: true }
        );        

        res.status(200).json({
          message: `Đã thêm ${userIds.length} sinh viên vào lớp`,
          addedCount: toAdd.length,
          alreadyInClass,
          updatedClass
        });
      });
  } catch (error) {
    console.error("[Import Students ERROR]", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.removeStudentFromClass = async (req, res) => {
  try {
    const { classId, userId } = req.params;

    const updatedClass = await Class.findOneAndUpdate(
      { class_id: classId }, 
      { $pull: { class_member: userId } }, // phải là class_member
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ message: 'Không tìm thấy lớp học' });
    }

    res.status(200).json({ message: 'Đã xoá sinh viên khỏi lớp', class: updatedClass });
  } catch (error) {
    console.error('Lỗi khi xoá sinh viên khỏi lớp:', error.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.addStudentToClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { email } = req.body;

    // Gọi sang UserService để lấy userId từ email
    const userServiceURL = "http://localhost:4003/api/users/get-ids-by-emails";
    const userResponse = await axios.post(userServiceURL, {
      emails: [email]
    });

    const userIds = userResponse.data.userIds;
    if (userIds.length === 0) {
      return res.status(404).json({ message: "Email không tồn tại trong hệ thống" });
    }

    const userId = userIds[0];

    const existingClass = await Class.findOne({ class_id: classId });

    if (existingClass.class_member.includes(userId)) {
      return res.status(409).json({ message: "Sinh viên đã tồn tại trong lớp" });
    }
    
    // Thêm userId vào class_member nếu chưa có
    const updatedClass = await Class.findOneAndUpdate(
      { class_id: classId },
      { $addToSet: { class_member: userId } },
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ message: "Không tìm thấy lớp học" });
    }

    res.status(200).json({
      message: "Đã thêm sinh viên vào lớp",
      class: updatedClass
    });
  } catch (error) {
    console.error("[Add Student ERROR]", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find({}, 'class_id class_name class_member');
    res.status(200).json(classes);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách lớp:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.assignTeacherToClass = async (req, res) => {
  try {
    const { class_id, teacher_id } = req.body;

    const updated = await Class.findOneAndUpdate(
      { class_id },
      { class_teacher: teacher_id },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy lớp" });
    }

    res.status(200).json({
      message: "Gán cố vấn cho lớp thành công",
      class: updated
    });
  } catch (error) {
    console.error("Lỗi khi gán cố vấn:", error.message);
    res.status(500).json({ message: "Lỗi server khi gán cố vấn cho lớp" });
  }
};

exports.adminDeleteStudentFromClass = async (req, res) => {
  const studentId = req.params.studentId;

  try {
    const classDoc = await Class.findOne({ class_member: studentId });

    if (!classDoc) return res.status(200).json({ message: "Sinh viên không thuộc lớp nào" });

    classDoc.class_member = classDoc.class_member.filter(id => id.toString() !== studentId);
    await classDoc.save();

    res.status(200).json({ message: "Đã xoá sinh viên khỏi lớp", classId: classDoc.class_id });
  } catch (error) {
    console.error("Lỗi khi xóa sinh viên khỏi lớp:", error.message);
    res.status(500).json({ message: "Không thể xóa sinh viên khỏi lớp" });
  }
};