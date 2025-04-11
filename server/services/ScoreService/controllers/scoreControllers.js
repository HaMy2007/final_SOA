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
        credit: subject.credit || 0,
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

    // Lấy bảng điểm từ Scoreboard
    const scoreboard = await Scoreboard.findOne({ user_id: studentId });
    if (!scoreboard || !scoreboard.score || scoreboard.score.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bảng điểm cho sinh viên này' });
    }

    // Lọc điểm theo học kỳ nếu có
    const scoreFilter = { _id: { $in: scoreboard.score } };
    if (semesterId) {
      scoreFilter.semester_id = new mongoose.Types.ObjectId(semesterId);
    }

    const scores = await Score.find(scoreFilter);

    // Lấy danh sách môn học từ EducationService
    const subjectRes = await axios.get('http://localhost:4001/api/subjects');
    const subjects = subjectRes.data;

    const subjectMap = {};
    subjects.forEach(sub => {
      subjectMap[sub.subject_code] = {
        name: sub.subject_name,
        credit: sub.credit
      };
    });

    // Tính GPA & tổng kết
    let totalCredits = 0;
    let totalWeightedScore = 0;

    const result = scores.map(sc => {
      const subject = subjectMap[sc.subject] || {};
      const credit = subject.credit || 0;
      const weighted = sc.score * credit;

      totalCredits += credit;
      totalWeightedScore += weighted;

      return {
        subject_code: sc.subject,
        subject_name: subject.name || 'Không rõ',
        credit,
        score: sc.score
      };
    });

    const gpa = totalCredits > 0 ? (totalWeightedScore / totalCredits).toFixed(2) : null;

    res.status(200).json({
      student_id: studentId,
      semester_id: semesterId || null,
      total_credits: totalCredits,
      gpa,
      scores: result
    });
  } catch (error) {
    console.error('Lỗi khi lấy điểm theo học kỳ:', error.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};


exports.getAccumulatedGPA = async (req, res) => {
  try {
    const studentId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: 'ID sinh viên không hợp lệ' });
    }

    const scoreboard = await Scoreboard.findOne({ user_id: studentId });
    if (!scoreboard || !scoreboard.score || scoreboard.score.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bảng điểm cho sinh viên này' });
    }

    const scores = await Score.find({ _id: { $in: scoreboard.score } });

    // Lấy toàn bộ subjects
    const subjectRes = await axios.get('http://localhost:4001/api/subjects');
    const subjects = subjectRes.data;

    const subjectMap = {};
    subjects.forEach(sub => {
      subjectMap[sub.subject_code] = {
        name: sub.subject_name,
        credit: sub.credit
      };
    });

    // Gom scores theo học kỳ
    const semesterData = {}; // { semester_id: { totalCredits, totalWeightedScore } }

    scores.forEach(sc => {
      const credit = subjectMap[sc.subject]?.credit || 0;
      const weightedScore = sc.score * credit;
      const semesterId = sc.semester_id.toString();

      if (!semesterData[semesterId]) {
        semesterData[semesterId] = {
          totalCredits: 0,
          totalWeightedScore: 0
        };
      }

      semesterData[semesterId].totalCredits += credit;
      semesterData[semesterId].totalWeightedScore += weightedScore;
    });

    let accumulatedCredits = 0;
    let accumulatedWeightedScore = 0;

    Object.values(semesterData).forEach(sem => {
      accumulatedCredits += sem.totalCredits;
      accumulatedWeightedScore += sem.totalWeightedScore;
    });

    const accumulatedGPA = accumulatedCredits > 0
      ? (accumulatedWeightedScore / accumulatedCredits).toFixed(2)
      : null;

    res.status(200).json({
      total_credits: accumulatedCredits,
      accumulated_gpa: accumulatedGPA
    });

  } catch (error) {
    console.error('Lỗi khi tính GPA tích lũy:', error.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.filterStudentsByGpaWithName = async (req, res) => {
  try {
    const { semester_id, range } = req.query;

    if (!semester_id || !mongoose.Types.ObjectId.isValid(semester_id)) {
      return res.status(400).json({ message: 'semester_id không hợp lệ' });
    }

    // Parse GPA range
    let minGpa = 0, maxGpa = 10;
    switch (range) {
      case '>=9.0': minGpa = 9.0; maxGpa = 10.0; break;
      case '8.0-9.0': minGpa = 8.0; maxGpa = 9.0; break;
      case '6.5-8.0': minGpa = 6.5; maxGpa = 8.0; break;
      case '5.0-6.5': minGpa = 5.0; maxGpa = 6.5; break;
      case '<5.0': minGpa = 0.0; maxGpa = 5.0; break;
      default: return res.status(400).json({ message: 'range không hợp lệ' });
    }

    const semesterObjectId = new mongoose.Types.ObjectId(semester_id);

    // Lấy toàn bộ bảng điểm của tất cả sinh viên
    const scoreboards = await Scoreboard.find({});
    const matched = [];

    for (const sb of scoreboards) {
      const scoreIds = sb.score || [];
      if (scoreIds.length === 0) continue;

      // Lấy các bản ghi Score thuộc kỳ học đang lọc
      const scores = await Score.find({
        _id: { $in: scoreIds },
        semester_id: semesterObjectId
      });

      if (scores.length === 0) continue;

      // Lấy các subject_id duy nhất để gọi lấy credit
      const subjectIds = [...new Set(scores.map(s => s.subject_id?.toString()).filter(Boolean))];
      if (subjectIds.length === 0) continue;

      const subjectRes = await axios.post('http://localhost:4001/api/subjects/batch', {
        ids: subjectIds
      });

      const creditMap = {};
      subjectRes.data.forEach(subject => {
        creditMap[subject._id] = subject.credit;
      });

      // Tính GPA
      let totalCredit = 0;
      let totalWeighted = 0;

      for (const s of scores) {
        const credit = creditMap[s.subject_id?.toString()] || 0;
        totalCredit += credit;
        totalWeighted += s.score * credit;
      }

      if (totalCredit === 0) continue;

      const gpa = +(totalWeighted / totalCredit).toFixed(2);

      // So sánh GPA sau khi đã tính đầy đủ
      if (gpa >= minGpa && gpa <= maxGpa) {
        matched.push({
          user_id: sb.user_id,
          gpa
        });
      }
    }

    // Lấy thông tin sinh viên theo user_id
    const userIds = matched.map(m => m.user_id);
    if (userIds.length === 0) {
      return res.status(200).json({ total: 0, students: [] });
    }

    const userRes = await axios.post('http://localhost:4003/api/users/batch', {
      ids: userIds
    });

    const userMap = {};
    userRes.data.forEach(u => {
      userMap[u._id] = u.name;
    });

    const result = matched.map(s => ({
      user_id: s.user_id,
      name: userMap[s.user_id] || 'Không rõ',
      gpa: s.gpa
    }));

    res.status(200).json({ total: result.length, students: result });
  } catch (err) {
    console.error('[ScoreService LỖI] [Lỗi lọc GPA theo kỳ]:', err.message);
    res.status(500).json({ message: 'Lỗi server hoặc không kết nối được các service' });
  }
};


exports.importStudentScores = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn file CSV' });

  const filePath = req.file.path;
  const records = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', row => records.push(row))
    .on('end', async () => {
      const inserted = [];

      for (const row of records) {
        try {
          const { tdt_id, subject_code, score, semester_code } = row;

          // Lấy subject_id từ SubjectService
          const subjectRes = await axios.get(`http://localhost:4001/api/subjects/code/${subject_code}`);
          const subject = subjectRes.data;

          // Lấy user_id từ UserService
          const userRes = await axios.get(`http://localhost:4003/api/users/tdt/${tdt_id}`);
          const user = userRes.data;

          // Lấy semester_id từ SemesterService
          const semesterRes = await axios.get(`http://localhost:4001/api/semesters/code/${semester_code}`);
          const semester = semesterRes.data;

          // Tạo score mới
          const newScore = new Score({
            score: parseFloat(score),
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
              status: []
            });
          } else {
            scoreboard.score.push(savedScore._id);
          }

          await scoreboard.save();
          inserted.push(savedScore);
        } catch (err) {
          console.error('[IMPORT ERROR]', err.message);
        }
      }

      res.status(200).json({ message: `Đã import ${inserted.length} điểm`, inserted });
    });
};
