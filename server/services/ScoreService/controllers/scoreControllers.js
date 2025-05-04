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

// exports.importStudentScores = async (req, res) => {
//   if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn file CSV' });

//   const teacher_id = req.user.id;
//   const filePath = req.file.path;
//   const records = [];
//   const inserted = [];
//   const skippedStudents = [];

//   const categoryWeight = {
//     "15phut": 0.1,
//     "1tiet": 0.2,
//     "giuaky": 0.2,
//     "cuoiky": 0.5
//   };

//   fs.createReadStream(filePath)
//     .pipe(csv())
//     .on('data', row => records.push(row))
//     .on('end', async () => {
//       for (const row of records) {
//         try {
//           const { tdt_id, subject_code, score, category, semester_code } = row;
//           console.log(`Processing row: tdt_id=${tdt_id}, category=${category}, score=${score}`);
//           const weight = categoryWeight[category.trim()];

//           if (!weight) {
//             skippedStudents.push({ tdt_id, reason: `Loại điểm không hợp lệ: ${category}` });
//             continue;
//           }
//           const subjectRes = await axios.get(`http://localhost:4001/api/subjects/code/${subject_code}`);
//           const subject = subjectRes.data;

//           const userRes = await axios.get(`http://localhost:4003/api/users/tdt/${tdt_id}`);
//           const user = userRes.data;

//           const semesterRes = await axios.get(`http://localhost:4001/api/semesters/code/${semester_code}`);
//           const semester = semesterRes.data;

//           const classRes = await axios.get(`http://localhost:4000/api/students/${user._id}/advisor`);
//           const classInfo = classRes.data;

//           if (!classInfo || !classInfo.advisor ||
//             !classInfo.advisor.id || classInfo.advisor?.id.toString() !== teacher_id.toString()) {
//             console.warn(`[SKIP] Sinh viên ${tdt_id} không thuộc lớp của cố vấn`);
//             skippedStudents.push({
//               tdt_id,
//               reason: "Không thuộc lớp cố vấn đang đăng nhập"
//             });
//             continue;
//           }          

//           const existing = await Score.findOne({
//             user_id: user._id,
//             subject_id: subject._id,
//             semester_id: semester._id,
//             category,
//             score: parseFloat(score)
//           });
  
//           if (existing) {
//             skipped.push({ tdt_id, reason: `Điểm ${category} đã tồn tại cho môn ${subject_code}` });
//             continue;
//           }

//           // Tạo score mới
//           const newScore = new Score({
//             score: parseFloat(score),
//             category,
//             subject_id: subject._id,
//             subject: subject.subject_code,
//             semester_id: semester._id
//           });

//           const savedScore = await newScore.save();
//           console.log(`Saved score: ${savedScore._id}, category=${category}`);

//           // Thêm vào scoreboard
//           let scoreboard = await Scoreboard.findOne({
//             user_id: user._id,
//             semester_id: semester._id
//           });

//           if (!scoreboard) {
//             scoreboard = new Scoreboard({
//               user_id: user._id,
//               semester_id: semester._id,
//               subjects: [],
//               status: 'CHƯA XẾP LOẠI',
//               gpa: 0
//             });
//           }

//           let subjectEntry = scoreboard.subjects.find(s => s.subject_id.toString() === subject._id.toString());

//           if (!subjectEntry) {
//             subjectEntry = {
//               subject_id: subject._id,
//               scores: [],
//               subjectGPA: 0
//             };
//             scoreboard.subjects = scoreboard.subjects.filter(s => s.subject_id.toString() !== subject._id.toString());
//             scoreboard.subjects.push(subjectEntry);
//           }
//           console.log(`Before push: subjectEntry.scores = ${subjectEntry.scores}`);

//           if (!subjectEntry.scores.some(scoreId => scoreId.equals(savedScore._id))) {
//             subjectEntry.scores.push(savedScore._id);
//             console.log(`Pushed score ${savedScore._id} to subjectEntry.scores`);
//           }
//           console.log(`After push: subjectEntry.scores = ${subjectEntry.scores}`);
  
//           // Lấy danh sách điểm hiện tại của môn học trong kỳ này
//           const allScores = await Score.find({
//             _id: { $in: subjectEntry.scores }
//           });

//           const categoryMap = {};
//           allScores.forEach(s => {
//             if (!categoryMap[s.category]) categoryMap[s.category] = [];
//             categoryMap[s.category].push(s.score);
//           });

//           const hasAll = ["15phut", "1tiet", "giuaky", "cuoiky"].every(c => categoryMap[c]?.length);
//           if (hasAll) {
//             let subjectGPA = 0;
//             for (const cat of Object.keys(categoryWeight)) {
//               const avg = categoryMap[cat].reduce((a, b) => a + b, 0) / categoryMap[cat].length;
//               subjectGPA += avg * categoryWeight[cat];
//             }
//             subjectEntry.subjectGPA = parseFloat(subjectGPA.toFixed(2));
//           }

//           // Tính GPA học kỳ từ các môn có đủ điểm
//           const validSubjects = scoreboard.subjects.filter(s => s.subjectGPA > 0);
//           const gpa = validSubjects.length > 0
//               ? validSubjects.reduce((sum, s) => sum + s.subjectGPA, 0) / validSubjects.length
//               : 0;

//           scoreboard.gpa = gpa;
//           scoreboard.status = getStatusFromGPA(gpa);

//           scoreboard.markModified('subjects');

//           await scoreboard.save();
//           console.log(`Scoreboard saved for user ${user._id}`);
//           inserted.push(savedScore);
//         } catch (err) {
//           console.error('[IMPORT ERROR]', err.message);
//           skippedStudents.push(row.tdt_id || "Không xác định");
//         }
//       }

//       if (inserted.length === 0) {
//         return res.status(400).json({
//           message: "Tải lên thất bại: Tất cả sinh viên đều không thuộc lớp của cố vấn.",
//           skipped: skippedStudents,
//         });
//       } else {
//         return res.status(200).json({
//           message: `Đã import ${inserted.length} điểm.`,
//           insertedCount: inserted.length,
//           skipped: skippedStudents,
//         });
//       }
//     });
// };

exports.importStudentScores = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn file CSV' });

  const teacher_id = req.user.id;
  const filePath = req.file.path;
  const records = [];
  const inserted = [];
  const skippedStudents = [];

  const categoryWeight = {
    "15p": 0.1,
    "1tiet": 0.2,
    "giuaky": 0.2,
    "cuoiky": 0.5,
  };

  // Category normalization mapping
  const categoryMapping = {
    "15phut": "15p",
    "15p": "15p",
    "1tiet": "1tiet",
    "giuaky": "giuaky",
    "cuoiky": "cuoiky",
  };

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', row => records.push(row))
    .on('end', async () => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        for (const row of records) {
          try {
            const { tdt_id, subject_code, score, category, semester_code } = row;
            const normalizedCategory = categoryMapping[category.trim()] || category.trim();
            const weight = categoryWeight[normalizedCategory];

            if (!weight) {
              skippedStudents.push({ tdt_id, reason: `Loại điểm không hợp lệ: ${category}` });
              continue;
            }

            // Fetch subject, user, semester, and class info
            const subjectRes = await axios.get(`http://localhost:4001/api/subjects/code/${subject_code}`);
            const subject = subjectRes.data;

            const userRes = await axios.get(`http://localhost:4003/api/users/tdt/${tdt_id}`);
            const user = userRes.data;

            const semesterRes = await axios.get(`http://localhost:4001/api/semesters/code/${semester_code}`);
            const semester = semesterRes.data;

            const classRes = await axios.get(`http://localhost:4000/api/students/${user._id}/advisor`);
            const classInfo = classRes.data;

            if (!classInfo || !classInfo.advisor || classInfo.advisor?.id.toString() !== teacher_id.toString()) {
              console.warn(`[SKIP] Sinh viên ${tdt_id} không thuộc lớp của cố vấn`);
              skippedStudents.push({ tdt_id, reason: "Không thuộc lớp cố vấn đang đăng nhập" });
              continue;
            }

            // Check for existing score
            const existing = await Score.findOne({
              user_id: user._id,
              subject_id: subject._id,
              semester_id: semester._id,
              category: normalizedCategory
            }).session(session);

            if (existing) {
              skippedStudents.push({ tdt_id, reason: `Điểm ${normalizedCategory} đã tồn tại cho môn ${subject_code}` });
              continue;
            }

            // Create and save new score
            const newScore = new Score({
              score: parseFloat(score),
              category: normalizedCategory,
              subject_id: subject._id,
              subject: subject.subject_code,
              semester_id: semester._id
            });

            const savedScore = await newScore.save({ session });
            inserted.push(savedScore);

            // Update scoreboard
            let scoreboard = await Scoreboard.findOne({
              user_id: user._id,
              semester_id: semester._id
            }).session(session);

            if (!scoreboard) {
              scoreboard = new Scoreboard({
                user_id: user._id,
                semester_id: semester._id,
                subjects: [],
                status: 'CHƯA XẾP LOẠI',
                gpa: 0
              });
            }

            // Find or create subjectEntry
            let subjectEntry = scoreboard.subjects.find(s => s.subject_id.toString() === subject._id.toString());

            if (!subjectEntry) {
              scoreboard.subjects.push({
                subject_id: subject._id,
                scores: [savedScore._id],
                subjectGPA: 0
              });              
            }else {
              // Nếu đã có, chỉ cần thêm score vào
              const alreadyIncluded = subjectEntry.scores.some(
                id => id.toString() === savedScore._id.toString()
              );
              if (!alreadyIncluded) {
                subjectEntry.scores.push(savedScore._id);
              }
            }
            const currentSubjectEntry = scoreboard.subjects.find(s => s.subject_id.toString() === subject._id.toString());
            const fullScores = await Score.find({ _id: { $in: currentSubjectEntry.scores } }).session(session);

            const scoreMap = {};
            for (const s of fullScores) {
              if (!scoreMap[s.category]) scoreMap[s.category] = [];
              scoreMap[s.category].push(s.score);
            }

            const hasAll = ["15p", "1tiet", "giuaky", "cuoiky"].every(c => scoreMap[c]?.length);
            if (hasAll) {
              let subjectGPA = 0;
              for (const cat of Object.keys(categoryWeight)) {
                const avg = scoreMap[cat].reduce((a, b) => a + b, 0) / scoreMap[cat].length;
                subjectGPA += avg * categoryWeight[cat];
              }
              currentSubjectEntry.subjectGPA = parseFloat(subjectGPA.toFixed(2));
            }

            // Cập nhật semester GPA
            const validSubjects = scoreboard.subjects.filter(s => s.subjectGPA > 0);
            const semesterGPA = validSubjects.length > 0
              ? validSubjects.reduce((sum, s) => sum + s.subjectGPA, 0) / validSubjects.length
              : 0;

            scoreboard.gpa = parseFloat(semesterGPA.toFixed(2));
            scoreboard.status = getStatusFromGPA(scoreboard.gpa);

            scoreboard.markModified('subjects');
            await scoreboard.save({ session });
            
          } catch (err) {
            console.error(`[IMPORT ERROR] tdt_id=${row.tdt_id}: ${err.message}`);
            skippedStudents.push({ tdt_id: row.tdt_id || "Không xác định", reason: err.message });
          }
        }

        await session.commitTransaction();
        
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
      } catch (err) {
        await session.abortTransaction();
        console.error('[TRANSACTION ERROR]', err.message);
        return res.status(500).json({ message: 'Lỗi server khi import điểm', error: err.message });
      } finally {
        session.endSession();
        // Clean up uploaded file
        fs.unlinkSync(filePath);
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
