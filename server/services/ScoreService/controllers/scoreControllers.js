const Score = require("../models/Score");
const Scoreboard = require('../models/ScoreBoard');
const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');
const xlsx = require('xlsx');

exports.getStudentScoresGroupedBySemester = async (req, res) => {
  try {
    const studentId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: 'ID sinh viên không hợp lệ' });
    }

    const scoreboard = await Scoreboard.findOne({ user_id: studentId });
    if (!scoreboard || !scoreboard.score.length) {
      return res.status(404).json({ message: 'Không tìm thấy bảng điểm' });
    }

    const scores = await Score.find({ _id: { $in: scoreboard.score } });

    const [subjectRes, semesterRes] = await Promise.all([
      axios.get('http://localhost:4001/api/subjects'),
      axios.get('http://localhost:4001/api/semesters')
    ]);

    const subjects = subjectRes.data;
    const semesters = semesterRes.data;

    const subjectMap = {};
    subjects.forEach(sub => {
      subjectMap[sub.subject_code] = {
        name: sub.subject_name,
        credit: sub.credit
      };
    });

    const semesterMap = {};
    semesters.forEach(sem => {
      semesterMap[sem._id] = { name: sem.semester_name, _id: sem._id };
    });

    const result = {};

    scores.forEach(sc => {
      const semester = semesterMap[sc.semester_id];
      if (!semester) return;

      if (!result[semester._id]) {
        result[semester._id] = {
          name: semester.name,
          scores: []
        };
      }

      const subject = subjectMap[sc.subject] || {};
      result[semester._id].scores.push({
        subject_code: sc.subject,
        subject_name: subject.name || 'Không rõ',
        score: sc.score
      });
    });

    res.status(200).json(result);

  } catch (error) {
    console.error('Lỗi khi lấy điểm sinh viên:', error.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};


exports.getStudentScoresBySemester = async (req, res) => {
  try {
    const studentId = req.params.id;
    const semesterId = req.query.semester_id;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: 'ID sinh viên không hợp lệ' });
    }

    if (semesterId && !mongoose.Types.ObjectId.isValid(semesterId)) {
      return res.status(400).json({ message: 'ID học kỳ không hợp lệ' });
    }

    const scoreboard = await Scoreboard.findOne({ user_id: studentId });
    if (!scoreboard || !scoreboard.score || scoreboard.score.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bảng điểm cho sinh viên này' });
    }

    const scoreFilter = { _id: { $in: scoreboard.score } };
    if (semesterId) {
      scoreFilter.semester_id = new mongoose.Types.ObjectId(semesterId);
    }

    const scores = await Score.find(scoreFilter);

    const subjectRes = await axios.get('http://localhost:4001/api/subjects');
    const subjects = subjectRes.data;

    const subjectMap = {};
    subjects.forEach(sub => {
      subjectMap[sub.subject_code] = {
        name: sub.subject_name,
      };
    });

    let totalScore = 0;

    const result = scores.map(sc => {
      const subject = subjectMap[sc.subject] || {};
      totalScore += sc.score;

      return {
        subject_code: sc.subject,
        subject_name: subject.name || 'Không rõ',
        score: sc.score
      };
    });

    const subjectCount = scores.length;
    const semesterGpa = subjectCount > 0 ? (totalScore / subjectCount).toFixed(2) : null;

    res.status(200).json({
      student_id: studentId,
      semester_id: semesterId || null,
      subject_count: subjectCount,
      semesterGpa: semesterGpa,
      gpa: scoreboard.gpa || 0,
      status: scoreboard.status || "Chưa có",
      scores: result
    });
  } catch (error) {
    console.error('Lỗi khi lấy điểm theo học kỳ:', error.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.importStudentScores = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn file CSV' });

  const teacher_id = req.user.id;
  const filePath = req.file.path;
  const records = [];
  const inserted = [];
  const skippedStudents = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', row => records.push(row))
    .on('end', async () => {
      for (const row of records) {
        try {
          const { tdt_id, subject_code, score, category, semester_code } = row;

          // Lấy subject_id từ SubjectService
          const subjectRes = await axios.get(`http://localhost:4001/api/subjects/code/${subject_code}`);
          const subject = subjectRes.data;

          // Lấy user_id từ UserService
          const userRes = await axios.get(`http://localhost:4003/api/users/tdt/${tdt_id}`);
          const user = userRes.data;

          const classRes = await axios.get(`http://localhost:4000/api/students/${user._id}/advisor`);
          const classInfo = classRes.data;

          console.log(`[DEBUG] classInfo for student ${tdt_id}:`, classInfo);

          if (!classInfo || !classInfo.advisor ||
            !classInfo.advisor.id || classInfo.advisor?.id.toString() !== teacher_id.toString()) {
            console.warn(`[SKIP] Sinh viên ${tdt_id} không thuộc lớp của cố vấn`);
            skippedStudents.push({
              tdt_id,
              reason: "Không thuộc lớp cố vấn đang đăng nhập"
            });
            continue;
          }

          // Lấy semester_id từ SemesterService
          const semesterRes = await axios.get(`http://localhost:4001/api/semesters/code/${semester_code}`);
          const semester = semesterRes.data;

          // Tạo score mới
          const newScore = new Score({
            score: parseFloat(score),
            category,
            subject_id: subject._id,
            subject: subject.subject_code,
            semester_id: semester._id
          });

          const savedScore = await newScore.save();

          // Thêm vào scoreboard
          let scoreboard = await Scoreboard.findOne({ user_id: user._id });
          if (!scoreboard) {
            scoreboard = new Scoreboard({
              user_id: user._id,
              score: [savedScore._id],
              status: '',
              gpa: 0
            });
          } else {
            scoreboard.score.push(savedScore._id);
          }

          const allScores = await Score.find({ _id: { $in: scoreboard.score } });
          const totalScore = allScores.reduce((sum, s) => sum + s.score, 0);
          const subjectCount = allScores.length;

          const gpa = subjectCount > 0 ? totalScore / subjectCount : 0;
          scoreboard.gpa = gpa;
          scoreboard.status = getStatusFromGPA(gpa);

          await scoreboard.save();
          inserted.push(savedScore);
        } catch (err) {
          console.error('[IMPORT ERROR]', err.message);
          skippedStudents.push(row.tdt_id || "Không xác định");
        }
      }

      if (inserted.length === 0) {
        return res.status(400).json({
          message: "Tải lên thất bại: Tất cả sinh viên đều không thuộc lớp của cố vấn.",
          skipped: skippedStudents,
        });
      } else {
        return res.status(200).json({
          message: `Đã import ${inserted.length} điểm.`,
          insertedCount: inserted.length,
          skipped: skippedStudents,
        });
      }
    });
};

function getStatusFromGPA(gpa) {
  if (gpa >= 9) return "XUẤT SẮC";
  if (gpa >= 8) return "GIỎI";
  if (gpa >= 6.5) return "KHÁ";
  if (gpa >= 5) return "TRUNG BÌNH";
  return "YẾU";
}
