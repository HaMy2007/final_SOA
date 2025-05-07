const Class = require("../models/Class");
const mongoose = require("mongoose");
const axios = require("axios");
const fs = require("fs");
const csv = require("csv-parser");

exports.getClassStudents = async (req, res) => {
  try {
    const classId = req.params.id;

    const classDoc = await Class.findOne({ class_id: classId });
    if (!classDoc) {
      return res
        .status(404)
        .json({ message: `Không tìm thấy lớp với mã ${classId}` });
    }

    const studentIds = classDoc.class_member;
    if (!studentIds || studentIds.length === 0) {
      return res.status(200).json({
        class_id: classDoc.class_id,
        class_name: classDoc.class_name,
        students: [],
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
    console.error("Lỗi khi lấy học sinh lớp:", error.message);
    res
      .status(500)
      .json({ message: "Lỗi server hoặc gọi user service thất bại" });
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
      return res.status(404).json({ message: "Lớp này chưa có giáo viên" });
    }

    const advisorRes = await axios.get(
      `http://localhost:4003/api/users/${advisorId}`
    );
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
    // console.error("[ClassService] Lỗi lấy thông tin giáo viên:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getClassesByTeacher = async (req, res) => {
  try {
    const teacherId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ message: "ID giáo viên không hợp lệ" });
    }

    const classDoc = await Class.findOne({ class_teacher: teacherId });
    if (!classDoc) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy lớp của giáo viên" });
    }

    res.status(200).json({
      class: {
        class_id: classDoc.class_id,
        class_name: classDoc.class_name,
        students: classDoc.class_member,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách lớp của giáo viên:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getClassByStudentId = async (req, res) => {
  try {
    const userId = req.params.id;

    const foundClass = await Class.findOne({ class_member: userId });
    if (!foundClass) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy lớp học của học sinh này" });
    }

    res.status(200).json({
      class: {
        class_id: foundClass.class_id,
        class_name: foundClass.class_name,
      },
    });
  } catch (err) {
    console.error("Lỗi tìm lớp theo học sinh:", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.removeAdvisorFromClass = async (req, res) => {
  const updated = await Class.findByIdAndUpdate(
    req.params.classId,
    { $unset: { class_teacher: "" } },
    { new: true }
  );
  res.json({ message: "Đã gỡ giáo viên khỏi lớp", class: updated });
};

exports.getClassByTeacherId = async (req, res) => {
  const classFound = await Class.findOne({
    class_teacher: req.params.teacherId,
  });
  if (!classFound)
    return res
      .status(404)
      .json({ message: "Không tìm thấy lớp có giáo viên này" });
  res.json(classFound);
};

exports.getAdvisorOfStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "ID học sinh không hợp lệ" });
    }

    const classDoc = await Class.findOne({ class_member: studentId });

    if (!classDoc) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy lớp chứa học sinh này" });
    }

    const advisorId = classDoc.class_teacher;

    const advisorResponse = await axios.get(
      `http://localhost:4003/api/users/${advisorId}`
    );
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
    console.error("Lỗi khi lấy thông tin giáo viên:", error.message);
    res
      .status(500)
      .json({ message: "Lỗi server hoặc kết nối đến UserService thất bại" });
  }
};

exports.addClass = async (req, res) => {
  try {
    const { class_id } = req.body;

    if (!class_id) {
      return res.status(400).json({ message: "Thiếu class_id" });
    }

    // Tự động gán class_name dựa theo class_id
    let class_name = "Không rõ";
    if (class_id.includes("12")) {
      class_name = "Khối 12";
    } else if (class_id.includes("11")) {
      class_name = "Khối 11";
    } else if (class_id.includes("10")) {
      class_name = "Khối 10";
    }

    // Kiểm tra trùng lặp class_id
    const existing = await Class.findOne({ class_id });
    if (existing) {
      return res.status(409).json({ message: "Lớp đã tồn tại" });
    }

    const newClass = new Class({
      class_id,
      class_name,
    });

    await newClass.save();

    res.status(201).json({
      message: "Thêm lớp thành công",
      class: newClass,
    });
  } catch (err) {
    console.error("Lỗi khi thêm lớp:", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getClassById = async (req, res) => {
  try {
    const { class_id } = req.params;

    const foundClass = await Class.findOne({ class_id });

    if (!foundClass) {
      return res.status(404).json({ message: "Không tìm thấy lớp" });
    }

    res.status(200).json({ class: foundClass });
  } catch (err) {
    console.error("Lỗi khi lấy lớp:", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getClassSizeById = async (req, res) => {
  try {
    const { class_id } = req.query;

    if (!class_id) {
      return res.status(400).json({ message: "Thiếu class_id" });
    }

    const classDoc = await Class.findOne({ class_id });

    if (!classDoc) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy lớp với class_id đã cho" });
    }

    const totalStudents = classDoc.class_member.length;

    res.status(200).json({
      class_id: classDoc.class_id,
      class_name: classDoc.class_name,
      totalStudents,
    });
  } catch (error) {
    console.error("[ClassService LỖI] [Lỗi lấy sĩ số lớp]:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.importStudentsToClass = async (req, res) => {
  try {
    const { classId } = req.params;
    if (!req.file)
      return res.status(400).json({ message: "Vui lòng tải lên file CSV" });

    const emails = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        if (row.email) emails.push(row.email.trim());
      })
      .on("end", async () => {
        if (emails.length === 0)
          return res.status(400).json({ message: "File không có email nào" });

        // Gửi sang UserService để lấy danh sách _id
        const userRes = await axios.post(
          "http://localhost:4003/api/users/get-ids-by-emails",
          {
            emails,
          }
        );

        const userIds = userRes.data.userIds;
        if (!Array.isArray(userIds) || userIds.length === 0)
          return res.status(400).json({
            message: "Không tìm thấy học sinh nào từ danh sách email",
          });

        const targetClass = await Class.findOne({ class_id: classId });
        if (!targetClass) {
          return res.status(404).json({ message: "Không tìm thấy lớp học" });
        }

        if (req.user.id !== targetClass.class_teacher.toString()) {
          return res.status(403).json({
            message: "Bạn không có quyền import học sinh vào lớp này",
          });
        }

        const existingIds = new Set(
          (targetClass.class_member || []).map((id) => id.toString())
        );
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
          message: `Đã thêm ${userIds.length} học sinh vào lớp`,
          addedCount: toAdd.length,
          alreadyInClass,
          updatedClass,
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
      return res.status(404).json({ message: "Không tìm thấy lớp học" });
    }

    res
      .status(200)
      .json({ message: "Đã xoá học sinh khỏi lớp", class: updatedClass });
  } catch (error) {
    console.error("Lỗi khi xoá học sinh khỏi lớp:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.addStudentToClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { email } = req.body;

    // Gọi sang UserService để lấy userId từ email
    const userServiceURL = "http://localhost:4003/api/users/get-ids-by-emails";
    const userResponse = await axios.post(userServiceURL, {
      emails: [email],
    });

    const userIds = userResponse.data.userIds;
    if (userIds.length === 0) {
      return res
        .status(404)
        .json({ message: "Email không tồn tại trong hệ thống" });
    }

    const userId = userIds[0];

    const existingClass = await Class.findOne({ class_id: classId });

    if (req.user.id !== existingClass.class_teacher.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền thêm học sinh vào lớp này" });
    }

    if (existingClass.class_member.includes(userId)) {
      return res.status(409).json({ message: "Học sinh đã tồn tại trong lớp" });
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
      message: "Đã thêm học sinh vào lớp",
      class: updatedClass,
    });
  } catch (error) {
    console.error("[Add Student ERROR]", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.addAdvisorToClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { email } = req.body;

    const userServiceURL = "http://localhost:4003/api/users/get-ids-by-emails";
    const userResponse = await axios.post(userServiceURL, {
      emails: [email],
    });

    const userIds = userResponse.data.userIds;
    if (!userIds || userIds.length === 0) {
      return res
        .status(404)
        .json({ message: "Email giáo viên không tồn tại trong hệ thống" });
    }

    const advisorId = userIds[0];

    const classWithSameTeacher = await Class.findOne({
      class_teacher: advisorId,
      class_id: { $ne: classId }, // bỏ qua lớp hiện tại (nếu đang cập nhật)
    });

    if (classWithSameTeacher) {
      return res.status(409).json({
        message: `Giáo viên đã là chủ nhiệm lớp ${classWithSameTeacher.class_id}`,
      });
    }

    const existingClass = await Class.findOne({ class_id: classId });

    if (!existingClass) {
      return res.status(404).json({ message: "Không tìm thấy lớp học" });
    }

    if (
      existingClass.class_teacher &&
      existingClass.class_teacher.toString() === advisorId
    ) {
      return res
        .status(409)
        .json({ message: "giáo viên đã được gán cho lớp này" });
    }
    existingClass.class_teacher = advisorId;
    await existingClass.save();

    try {
      await axios.put(
        `http://localhost:4003/api/users/${advisorId}/add-homeroom-teacher`
      );
    } catch (err) {
      console.warn(
        "Không thể cập nhật advisor_type:",
        err.response?.data || err.message
      );
    }

    res.status(200).json({
      message: "Đã thêm giáo viên vào lớp",
      class: existingClass,
    });
  } catch (error) {
    console.error("[Add Advisor ERROR]", error.message);
    res.status(500).json({ message: "Lỗi server khi thêm giáo viên" });
  }
};

exports.changeAdvisorOfClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { email } = req.body;

    const userServiceURL = "http://localhost:4003/api/users/get-ids-by-emails";
    const userResponse = await axios.post(userServiceURL, {
      emails: [email],
    });

    const userIds = userResponse.data.userIds;
    if (!userIds || userIds.length === 0) {
      return res
        .status(404)
        .json({ message: "Email giáo viên không tồn tại trong hệ thống" });
    }

    const newAdvisorId = userIds[0];

    const existingClass = await Class.findOne({ class_id: classId });
    if (!existingClass) {
      return res.status(404).json({ message: "Không tìm thấy lớp học" });
    }

    const currentAdvisorId = existingClass.class_teacher?.toString();

    if (currentAdvisorId === newAdvisorId) {
      return res
        .status(409)
        .json({ message: "Đây đã là giáo viên hiện tại" });
    }

    const classWithSameTeacher = await Class.findOne({
      class_teacher: newAdvisorId,
      class_id: { $ne: classId },
    });

    if (classWithSameTeacher) {
      return res.status(409).json({
        message: `Giáo viên đã là chủ nhiệm lớp ${classWithSameTeacher.class_id}`,
      });
    }

    if (currentAdvisorId) {
      try {
        await axios.put(`http://localhost:4003/api/users/${currentAdvisorId}/remove-homeroom-teacher`);
      } catch (err) {
        console.warn("Không thể cập nhật advisor_type giáo viên cũ:", err?.response?.data || err.message);
      }
    }

    try {
      await axios.put(`http://localhost:4003/api/users/${newAdvisorId}/add-homeroom-teacher`);
    } catch (err) {
      console.warn("Không thể cập nhật advisor_type giáo viên mới:", err?.response?.data || err.message);
    }

    existingClass.class_teacher = newAdvisorId;
    await existingClass.save();

    res.status(200).json({
      message: "Đã cập nhật giáo viên lớp thành công",
      class: existingClass,
    });
  } catch (error) {
    console.error("[Edit Advisor ERROR]", error.message);
    res.status(500).json({ message: "Lỗi server khi cập nhật giáo viên" });
  }
};

exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find(
      {},
      "class_id class_name class_member class_teacher"
    );
    res.status(200).json(classes);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách lớp:", err.message);
    res.status(500).json({ message: "Lỗi server" });
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

    try {
      await axios.put(`http://localhost:4003/api/users/${teacher_id}/add-homeroom-teacher`);
    } catch (err) {
      console.warn("Không thể cập nhật advisor_type:", err.response?.data || err.message);
    }

    res.status(200).json({
      message: "Gán giáo viên cho lớp thành công",
      class: updated,
    });
  } catch (error) {
    console.error("Lỗi khi gán giáo viên:", error.message);
    res.status(500).json({ message: "Lỗi server khi gán giáo viên cho lớp" });
  }
};

exports.adminDeleteStudentFromClass = async (req, res) => {
  const studentId = req.params.studentId;

  try {
    const classDoc = await Class.findOne({ class_member: studentId });

    if (!classDoc)
      return res.status(200).json({ message: "Học sinh không thuộc lớp nào" });

    classDoc.class_member = classDoc.class_member.filter(
      (id) => id.toString() !== studentId
    );
    await classDoc.save();

    res.status(200).json({
      message: "Đã xoá học sinh khỏi lớp",
      classId: classDoc.class_id,
    });
  } catch (error) {
    console.error("Lỗi khi xóa học sinh khỏi lớp:", error.message);
    res.status(500).json({ message: "Không thể xóa học sinh khỏi lớp" });
  }
};

exports.addSubjectTeacherToClass = async (req, res) => {
  try {
    const { user_id } = req.body;
    const { classId } = req.params;

    if (!user_id) {
      return res.status(400).json({ message: "Thiếu user_id giáo viên" });
    }

    // Tìm lớp học
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Không tìm thấy lớp học" });
    }

    // Kiểm tra xem giáo viên đã có trong danh sách chưa
    if (classData.subject_teacher.some((u) => u.toString() === user_id)) {
      return res.status(400).json({ message: "Giáo viên đã tồn tại trong lớp này" });
    }

    // Thêm giáo viên vào subject_teacher
    classData.subject_teacher.push(user_id);
    await classData.save();

    return res.status(200).json({ message: "Thêm giáo viên vào lớp thành công" });
  } catch (error) {
    console.error("[Add Subject Teacher ERROR]", error.message);
    return res.status(500).json({ message: "Lỗi server khi thêm giáo viên vào lớp" });
  }
};

exports.getClassesByTdtId = async (req, res) => {
  const { tdt_id } = req.params;

  try {
    const user = await axios.get(`http://localhost:4003/api/users/tdt/${tdt_id}`);
    const userId = user.data._id;
    
    if (!userId) {
      return res.status(404).json({ message: "Không tìm thấy người dùng với tdt_id này" });
    }

    const classes = await Class.find({
      subject_teacher: userId
    })
    return res.status(200).json(classes);
  } catch (error) {
    console.error("[ERROR] Lấy danh sách lớp theo tdt_id:", error.message);
    return res.status(500).json({ message: "Lỗi server khi lấy lớp học" });
  }
};

exports.addClassForTeacher = async (req, res) => {
  const { class_id, teacher_id } = req.body; 

  if (!class_id || !teacher_id) {
    return res.status(400).json({ message: "Thiếu class_id hoặc teacher_id" });
  }

  try {
    // 1. Lấy thông tin giáo viên từ UserService
    const teacherRes = await axios.get(`http://localhost:4003/api/users/${teacher_id}`);
    const teacher = teacherRes.data;
    const tdt_id = teacher.tdt_id;

    // 2. Lấy danh sách môn giáo viên dạy từ DepartmentService
    const subjectRes = await axios.get(`http://localhost:4001/api/departments/${tdt_id}/subjects`);
    const teacherSubjects = subjectRes.data; // [{ subject_code, subject_id }]

    if (!Array.isArray(teacherSubjects)) {
      return res.status(400).json({ message: "Không lấy được danh sách môn học của giáo viên" });
    }

    // 3. Lấy thông tin lớp từ ClassService (service hiện tại)
    const classRes = await axios.get(`http://localhost:4000/api/${class_id}`);
    const foundClass = classRes.data.class;

    if (!foundClass) {
      return res.status(404).json({ message: "Không tìm thấy lớp" });
    }

    // 4. Lấy danh sách giáo viên hiện tại đã dạy lớp đó
    const currentTeacherIds = foundClass.subject_teacher || [];

    // 5. Gọi đến UserService để lấy danh sách thông tin giáo viên hiện tại
    const existingTeachers = await Promise.all(
      currentTeacherIds.map(id =>
        axios.get(`http://localhost:4003/api/users/${id}`).then(res => res.data)
      )
    );

    // 6. Gọi đến DepartmentService để lấy danh sách môn của từng giáo viên hiện tại
    const existingSubjectsMap = new Map(); // key: subject_code, value: { subject_name, teacher_id }

    for (const t of existingTeachers) {
      const deptRes = await axios.get(`http://localhost:4001/api/departments/${t.tdt_id}/subjects`);
      const subjects = deptRes.data;
      subjects.forEach(sub => {
        if (!existingSubjectsMap.has(sub.subject_code)) {
          existingSubjectsMap.set(sub.subject_code, {
            subject_name: sub.subject_name,
            tdt_id: t.tdt_id,
          });
        }
      });
    }

    // 7. Kiểm tra xem có môn nào trùng không
    const conflicts = teacherSubjects.filter(sub => existingSubjectsMap.has(sub.subject_code));
    if (conflicts.length > 0) {
      const messages = conflicts.map(conflict => {
        const existing = existingSubjectsMap.get(conflict.subject_code);
        return `Môn học "${existing.subject_name}" của lớp "${class_id}" đã có người dạy (teacher_id: ${existing.tdt_id})`;
      });

      return res.status(400).json({ message: messages.join("; ") });
    }

    const objectIdTeacher = new mongoose.Types.ObjectId(teacher_id);

    const updatedClass = await Class.findOneAndUpdate(
      { class_id: class_id }, // dùng class_id (string)
      { $addToSet: { subject_teacher: objectIdTeacher } },
      { new: true }
    );    

    res.status(200).json({
      message: "Gán giáo viên vào lớp thành công",
      updatedClass,
    });
  } catch (err) {
    console.error("Lỗi khi phân công giáo viên:", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.removeTeacherFromClass = async (req, res) => {
  const { class_id, teacher_id } = req.body;

  if (!class_id || !teacher_id) {
    return res.status(400).json({ message: "Thiếu class_id hoặc teacher_id" });
  }

  try {
    const updatedClass = await Class.findOneAndUpdate(
      { _id: class_id },
      // { $pull: { subject_teacher: teacher_id } },
      { $pull: { subject_teacher: new mongoose.Types.ObjectId(teacher_id) } },
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ message: "Không tìm thấy lớp học" });
    }

    return res.status(200).json({
      message: "Đã xóa giáo viên khỏi lớp thành công",
      data: updatedClass,
    });
  } catch (error) {
    console.error("[LỖI] Xóa giáo viên khỏi lớp:", error.message);
    return res.status(500).json({ message: "Lỗi server khi xóa giáo viên khỏi lớp" });
  }
};

exports.getSubjectsOfClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    
    // Lấy lớp từ cơ sở dữ liệu
    const classData = await Class.findOne({ class_id: classId });

    if (!classData) {
      return res.status(404).json({ message: "Lớp không tồn tại" });
    }

    // Lấy tất cả _id của giáo viên từ trường subject_teacher
    const teacherIds = classData.subject_teacher;

    const subjects = [];
    
    // Lặp qua tất cả các giáo viên và gọi API của service User để lấy thông tin giáo viên
    for (const teacherId of teacherIds) {
      // Gọi API của service User để lấy thông tin giáo viên
      const teacherRes = await axios.get(`http://localhost:4003/api/users/${teacherId}`);
      const teacherData = teacherRes.data;

      if (!teacherData) {
        return res.status(404).json({ message: `Không tìm thấy thông tin giáo viên với ID: ${teacherId}` });
      }

      const { _id, name, tdt_id, phone_number, email } = teacherData;

      // Gọi API lấy thông tin môn học của giáo viên từ service Department
      const subjectsRes = await axios.get(`http://localhost:4001/api/departments/${tdt_id}/subjects`);
      const teacherSubjects = subjectsRes.data;

      // Thêm thông tin giáo viên và môn học vào mảng subjects
      teacherSubjects.forEach(subject => {
        subjects.push({
          teacher_id: _id,
          teacher_name: name,
          tdt_id,
          phone_number,
          email,
          subject_id: subject._id,
          subject_name: subject.subject_name,
          subject_code: subject.subject_code
        });
      });
    }

    // Trả về thông tin môn học và thông tin giáo viên trong lớp
    res.status(200).json(subjects);

  } catch (err) {
    console.error("Lỗi:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};