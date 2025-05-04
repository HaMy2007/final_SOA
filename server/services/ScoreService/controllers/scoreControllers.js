const Score = require("../models/Score");
const Scoreboard = require("../models/ScoreBoard");
const mongoose = require("mongoose");
const axios = require("axios");
const fs = require("fs");
const csv = require("csv-parser");
const xlsx = require("xlsx");

exports.getStudentScoresGroupedBySemester = async (req, res) => {
  try {
    const studentId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "ID học sinh không hợp lệ" });
    }

<<<<<<< Updated upstream
    // Lấy tất cả scoreboard của sinh viên
    const scoreboards = await Scoreboard.find({ user_id: studentId })
      .populate({
        path: 'subjects.scores',
        model: 'scores'
      });

    if (!scoreboards.length) {
      return res.status(404).json({ message: 'Không tìm thấy bảng điểm' });
    }

    const semesters = await axios.get('http://localhost:4001/api/semesters');
    const semesterMap = {};
    semesters.data.forEach((sem) => {
      semesterMap[sem._id] = sem.semester_name;
=======
    const scoreboard = await Scoreboard.findOne({ user_id: studentId });
    if (!scoreboard || !scoreboard.score.length) {
      return res.status(404).json({ message: "Không tìm thấy bảng điểm" });
    }

    const scores = await Score.find({ _id: { $in: scoreboard.score } });

    const [subjectRes, semesterRes] = await Promise.all([
      axios.get("http://localhost:4001/api/subjects"),
      axios.get("http://localhost:4001/api/semesters"),
    ]);

    const subjects = subjectRes.data;
    const semesters = semesterRes.data;

    const subjectMap = {};
    subjects.forEach((sub) => {
      subjectMap[sub.subject_code] = {
        name: sub.subject_name,
        credit: sub.credit,
      };
    });

    const semesterMap = {};
    semesters.forEach((sem) => {
      semesterMap[sem._id] = { name: sem.semester_name, _id: sem._id };
>>>>>>> Stashed changes
    });

    const result = {};

<<<<<<< Updated upstream
    for (const sb of scoreboards) {
      const semesterId = sb.semester_id.toString();
      if (!result[semesterId]) {
        result[semesterId] = {
          name: semesterMap[semesterId] || 'Không rõ',
          scores: []
        };
      }

      for (const subj of sb.subjects) {
        const subjectScores = subj.scores.reduce((acc, scoreDoc) => {
          acc[scoreDoc.category] = scoreDoc.score;
          acc.subject_code = scoreDoc.subject;
          acc.subject_id = scoreDoc.subject_id;
          acc.score = acc.score ?? scoreDoc.score;
          return acc;
        }, {});
        result[semesterId].scores.push(subjectScores);
      }
    }
=======
    scores.forEach((sc) => {
      const semester = semesterMap[sc.semester_id];
      if (!semester) return;

      if (!result[semester._id]) {
        result[semester._id] = {
          name: semester.name,
          scores: [],
        };
      }

      const subject = subjectMap[sc.subject] || {};
      result[semester._id].scores.push({
        subject_code: sc.subject,
        subject_name: subject.name || "Không rõ",
        score: sc.score,
      });
    });
>>>>>>> Stashed changes

    res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi khi lấy điểm học sinh:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getStudentScoresBySemester = async (req, res) => {
  try {
    const studentId = req.params.id;
    const semesterId = req.query.semester_id;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "ID học sinh không hợp lệ" });
    }

<<<<<<< Updated upstream
    const filter = { user_id: studentId };
=======
    if (semesterId && !mongoose.Types.ObjectId.isValid(semesterId)) {
      return res.status(400).json({ message: "ID học kỳ không hợp lệ" });
    }

    const scoreboard = await Scoreboard.findOne({ user_id: studentId });
    if (!scoreboard || !scoreboard.score || scoreboard.score.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bảng điểm cho học sinh này" });
    }

    const scoreFilter = { _id: { $in: scoreboard.score } };
>>>>>>> Stashed changes
    if (semesterId) {
      if (!mongoose.Types.ObjectId.isValid(semesterId)) {
        return res.status(400).json({ message: 'ID học kỳ không hợp lệ' });
      }
      filter.semester_id = semesterId;
    }

    const scoreboards = await Scoreboard.find(filter).populate({
      path: 'subjects.scores',
      model: 'scores'
    });

<<<<<<< Updated upstream
    if (!scoreboards.length) {
      return res.status(404).json({ message: 'Không tìm thấy bảng điểm' });
    }
=======
    const subjectRes = await axios.get("http://localhost:4001/api/subjects");
    const subjects = subjectRes.data;
>>>>>>> Stashed changes

    // Lấy danh sách môn học từ API
    const subjectsRes = await axios.get('http://localhost:4001/api/subjects');
    const subjectMap = {};
<<<<<<< Updated upstream
    subjectsRes.data.forEach(sub => {
      subjectMap[sub._id] = {
=======
    subjects.forEach((sub) => {
      subjectMap[sub.subject_code] = {
>>>>>>> Stashed changes
        name: sub.subject_name,
        code: sub.subject_code
        code: sub.subject_code
      };
    });

    const allGrades = [];
    let semesterGPA = null;

<<<<<<< Updated upstream
    for (const sb of scoreboards) {
      semesterGPA = sb.gpa;

      for (const subj of sb.subjects) {
        const subject = subjectMap[subj.subject_id] || {};
        const scoreDetails = subj.scores.reduce((acc, s) => {
          acc[`score_${s.category}`] = s.score;
          return acc;
        }, {});

        allGrades.push({
          subject_code: subject.code || 'Không rõ',
          subject_name: subject.name || 'Không rõ',
          subject_id: subj.subject_id,
          ...scoreDetails,
          score: subj.subjectGPA,
          semester_id: sb.semester_id
        });
      }
    }
=======
    const result = scores.map((sc) => {
      const subject = subjectMap[sc.subject] || {};
      totalScore += sc.score;

      return {
        subject_code: sc.subject,
        subject_name: subject.name || "Không rõ",
        score: sc.score,
      };
    });

    const subjectCount = scores.length;
    const semesterGpa =
      subjectCount > 0 ? (totalScore / subjectCount).toFixed(2) : null;
>>>>>>> Stashed changes

    res.status(200).json({
      student_id: studentId,
      semester_id: semesterId || null,
<<<<<<< Updated upstream
      subject_count: allGrades.length,
      semesterGpa: semesterGPA,
      gpa: semesterGPA,
      status: scoreboards[0].status,
      scores: allGrades
=======
      subject_count: subjectCount,
      semesterGpa: semesterGpa,
      gpa: scoreboard.gpa || 0,
      status: scoreboard.status || "Chưa có",
      scores: result,
>>>>>>> Stashed changes
    });


  } catch (error) {
    console.error("Lỗi khi lấy điểm theo học kỳ:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

<<<<<<< Updated upstream
=======
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
//             console.warn(`[SKIP] Học sinh ${tdt_id} không thuộc lớp của giáo viên`);
//             skippedStudents.push({
//               tdt_id,
//               reason: "Không thuộc lớp giáo viên đang đăng nhập"
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
//           message: "Tải lên thất bại: Tất cả học sinh đều không thuộc lớp của giáo viên.",
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

>>>>>>> Stashed changes
exports.importStudentScores = async (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: "Vui lòng chọn file CSV" });

  const teacher_id = req.user.id;
  const filePath = req.file.path;
  const records = [];
  const inserted = [];
  const skippedStudents = [];

  const categoryWeight = {
    "15p": 0.1,
    "1tiet": 0.2,
    giuaky: 0.2,
    cuoiky: 0.5,
  };

  // Category normalization mapping
  const categoryMapping = {
    "15phut": "15p",
    "15p": "15p",
    "1tiet": "1tiet",
    giuaky: "giuaky",
    cuoiky: "cuoiky",
  };

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => records.push(row))
    .on("end", async () => {
      const session = await mongoose.startSession();
      session.startTransaction();
      let committed = false;
      let committed = false;
      try {
        for (const row of records) {
          try {
            const { tdt_id, subject_code, score, category, semester_code } =
              row;
            const normalizedCategory =
              categoryMapping[category.trim()] || category.trim();
            const weight = categoryWeight[normalizedCategory];

            if (!weight) {
              skippedStudents.push({
                tdt_id,
                reason: `Loại điểm không hợp lệ: ${category}`,
              });
              continue;
            }

            // Fetch subject, user, semester, and class info
            const subjectRes = await axios.get(
              `http://localhost:4001/api/subjects/code/${subject_code}`
            );
            const subject = subjectRes.data;

            const userRes = await axios.get(
              `http://localhost:4003/api/users/tdt/${tdt_id}`
            );
            const user = userRes.data;

            const semesterRes = await axios.get(
              `http://localhost:4001/api/semesters/code/${semester_code}`
            );
            const semester = semesterRes.data;

            const classRes = await axios.get(
              `http://localhost:4000/api/students/${user._id}/advisor`
            );
            const classInfo = classRes.data;

<<<<<<< Updated upstream
            if (!semester || !semester._id) {
              console.log(`❌ Không tìm thấy học kỳ với mã: ${semesterKey}`);
              skippedStudents.push({ mssv, reason: `Không tìm thấy học kỳ với mã: ${semesterKey}` });
              continue;
            }

            if (!classInfo || !classInfo.advisor || classInfo.advisor?.id.toString() !== teacher_id.toString()) {
              console.warn(`[SKIP] Sinh viên ${tdt_id} không thuộc lớp của cố vấn`);
              skippedStudents.push({ tdt_id, reason: "Không thuộc lớp cố vấn đang đăng nhập" });
=======
            if (
              !classInfo ||
              !classInfo.advisor ||
              classInfo.advisor?.id.toString() !== teacher_id.toString()
            ) {
              console.warn(
                `[SKIP] Học sinh ${tdt_id} không thuộc lớp của giáo viên`
              );
              skippedStudents.push({
                tdt_id,
                reason: "Không thuộc lớp giáo viên đang đăng nhập",
              });
>>>>>>> Stashed changes
              continue;
            }

            // Check for existing score
            const existing = await Score.findOne({
              user_id: user._id,
              subject_id: subject._id,
              semester_id: semester._id,
              category: normalizedCategory,
            }).session(session);

            if (existing) {
              skippedStudents.push({
                tdt_id,
                reason: `Điểm ${normalizedCategory} đã tồn tại cho môn ${subject_code}`,
              });
              continue;
            }

            // Create and save new score
            const newScore = new Score({
              user_id: user._id,
              user_id: user._id,
              score: parseFloat(score),
              category: normalizedCategory,
              subject_id: subject._id,
              subject: subject.subject_code,
              semester_id: semester._id,
            });

            const savedScore = await newScore.save({ session });
            inserted.push(savedScore);

            // Update scoreboard
            let scoreboard = await Scoreboard.findOne({
              user_id: user._id,
              semester_id: semester._id,
            }).session(session);

            if (!scoreboard) {
              scoreboard = new Scoreboard({
                user_id: user._id,
                semester_id: semester._id,
                subjects: [],
                status: "CHƯA XẾP LOẠI",
                gpa: 0,
              });
            }

            // Find or create subjectEntry
            let subjectEntry = scoreboard.subjects.find(
              (s) => s.subject_id.toString() === subject._id.toString()
            );

            if (!subjectEntry) {
              scoreboard.subjects.push({
                subject_id: subject._id,
                scores: [savedScore._id],
                subjectGPA: 0,
              });
            } else {
              // Nếu đã có, chỉ cần thêm score vào
              const alreadyIncluded = subjectEntry.scores.some(
                (id) => id.toString() === savedScore._id.toString()
              );
              if (!alreadyIncluded) {
                subjectEntry.scores.push(savedScore._id);
              }
            }
            const currentSubjectEntry = scoreboard.subjects.find(
              (s) => s.subject_id.toString() === subject._id.toString()
            );
            const fullScores = await Score.find({
              _id: { $in: currentSubjectEntry.scores },
            }).session(session);

            const scoreMap = {};
            for (const s of fullScores) {
              if (!scoreMap[s.category]) scoreMap[s.category] = [];
              scoreMap[s.category].push(s.score);
            }

            const hasAll = ["15p", "1tiet", "giuaky", "cuoiky"].every(
              (c) => scoreMap[c]?.length
            );
            if (hasAll) {
              let subjectGPA = 0;
              for (const cat of Object.keys(categoryWeight)) {
                const avg =
                  scoreMap[cat].reduce((a, b) => a + b, 0) /
                  scoreMap[cat].length;
                subjectGPA += avg * categoryWeight[cat];
              }
              currentSubjectEntry.subjectGPA = parseFloat(
                subjectGPA.toFixed(2)
              );
            }

            // Cập nhật semester GPA
            const validSubjects = scoreboard.subjects.filter(
              (s) => s.subjectGPA > 0
            );
            const semesterGPA =
              validSubjects.length > 0
                ? validSubjects.reduce((sum, s) => sum + s.subjectGPA, 0) /
                  validSubjects.length
                : 0;

            scoreboard.gpa = parseFloat(semesterGPA.toFixed(2));
            scoreboard.status = getStatusFromGPA(scoreboard.gpa);

            scoreboard.markModified("subjects");
            await scoreboard.save({ session });
          } catch (err) {
            console.error(
              `[IMPORT ERROR] tdt_id=${row.tdt_id}: ${err.message}`
            );
            skippedStudents.push({
              tdt_id: row.tdt_id || "Không xác định",
              reason: err.message,
            });
          }
        }
        await session.commitTransaction();
<<<<<<< Updated upstream
        committed = true;
=======
>>>>>>> Stashed changes

        if (inserted.length === 0) {
          return res.status(400).json({
            message:
              "Tải lên thất bại: Tất cả học sinh đều không thuộc lớp của giáo viên.",
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
<<<<<<< Updated upstream
        if (!committed) {
          await session.abortTransaction();
        }
        console.error('[TRANSACTION ERROR]', err.message);
        return res.status(500).json({ message: 'Lỗi server khi import điểm', error: err.message });
=======
        await session.abortTransaction();
        console.error("[TRANSACTION ERROR]", err.message);
        return res
          .status(500)
          .json({ message: "Lỗi server khi import điểm", error: err.message });
>>>>>>> Stashed changes
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

exports.updateScore = async (req, res) => {
  const { user_id, subject_id, semester_id, scores } = req.body;

  if (!user_id || !subject_id || !semester_id || !scores || typeof scores !== "object") {
    return res.status(400).json({ message: "Thiếu dữ liệu hoặc dữ liệu không hợp lệ." });
  }

  try {
    const updateResults = [];
    let totalPoints = 0;  
    let subjectScoreCount = 0;  

    for (const [category, score] of Object.entries(scores)) {
      let updated = await Score.findOne({ user_id, subject_id, semester_id, category });

      if (!updated) {
        const subjectRes = await axios.get(`http://localhost:4001/api/subjects/${subject_id}`);
        const subjectCode = subjectRes.data.subject_code;

        updated = await Score.create({
          user_id,
          subject_id,
          semester_id,
          category,
          score,
          subject: subjectCode
        });
        updateResults.push(updated);
      } else {
        updated.score = score;
        updated.updatedAt = new Date();
        await updated.save();
        updateResults.push(updated); 
      }

      totalPoints += score;
      subjectScoreCount++;
    }

    const fifteenPoints = scores['15p'] || 0;   
    const oneTestPoints = scores['1tiet'] || 0;  
    const midtermPoints = scores['giuaky'] || 0; 
    const finalPoints = scores['cuoiky'] || 0;   

    const subjectGPA = (fifteenPoints * 0.1) + (oneTestPoints * 0.2) + (midtermPoints * 0.2) + (finalPoints * 0.5);

    const scoreboard = await Scoreboard.findOne({ user_id, semester_id });
    if (scoreboard) {
      const subject = scoreboard.subjects.find(s => s.subject_id.toString() === subject_id.toString());
      if (subject) {
        subject.subjectGPA = subjectGPA;
    
        for (const updatedScore of updateResults) {
          const exists = subject.scores.some(s => s.toString() === updatedScore._id.toString());
          if (!exists) {
            subject.scores.push(updatedScore._id);
          }
        }
    
        const totalGPA = scoreboard.subjects.reduce((acc, subj) => acc + subj.subjectGPA, 0);
        scoreboard.gpa = totalGPA / scoreboard.subjects.length;
    
        await scoreboard.save();
      }
    }    

    res.json({
      message: "Cập nhật điểm và tính lại GPA thành công",
      updated: updateResults,
    });
  } catch (err) {
    console.error("Lỗi cập nhật điểm:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
