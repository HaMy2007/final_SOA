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
      return res.status(400).json({ message: "ID sinh viên không hợp lệ" });
    }

    // Lấy tất cả scoreboard của sinh viên
    const scoreboards = await Scoreboard.find({ user_id: studentId }).populate({
      path: "subjects.scores",
      model: "scores",
    });

    if (!scoreboards.length) {
      return res.status(404).json({ message: "Không tìm thấy bảng điểm" });
    }

    const semesters = await axios.get("http://localhost:4001/api/semesters");
    const semesterMap = {};
    semesters.data.forEach((sem) => {
      semesterMap[sem._id] = sem.semester_name;
    });

    const result = {};

    for (const sb of scoreboards) {
      const semesterId = sb.semester_id.toString();
      if (!result[semesterId]) {
        result[semesterId] = {
          name: semesterMap[semesterId] || "Không rõ",
          scores: [],
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

    res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi khi lấy điểm sinh viên:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getStudentScoresBySemester = async (req, res) => {
  try {
    const studentId = req.params.id;
    const semesterId = req.query.semester_id;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "ID sinh viên không hợp lệ" });
    }

    const filter = { user_id: studentId };
    if (semesterId) {
      if (!mongoose.Types.ObjectId.isValid(semesterId)) {
        return res.status(400).json({ message: "ID học kỳ không hợp lệ" });
      }
      filter.semester_id = semesterId;
    }

    const scoreboards = await Scoreboard.find(filter).populate({
      path: "subjects.scores",
      model: "scores",
    });

    if (!scoreboards.length) {
      return res.status(404).json({ message: "Không tìm thấy bảng điểm" });
    }

    // Lấy danh sách môn học từ API
    const subjectsRes = await axios.get("http://localhost:4001/api/subjects");
    const subjectMap = {};
    subjectsRes.data.forEach((sub) => {
      subjectMap[sub._id] = {
        name: sub.subject_name,
        code: sub.subject_code,
      };
    });

    const allGrades = [];
    let semesterGPA = null;

    for (const sb of scoreboards) {
      semesterGPA = sb.gpa;

      for (const subj of sb.subjects) {
        const subject = subjectMap[subj.subject_id] || {};
        const scoreDetails = subj.scores.reduce((acc, s) => {
          acc[`score_${s.category}`] = s.score;
          return acc;
        }, {});

        allGrades.push({
          subject_code: subject.code || "Không rõ",
          subject_name: subject.name || "Không rõ",
          subject_id: subj.subject_id,
          ...scoreDetails,
          score: subj.subjectGPA,
          semester_id: sb.semester_id,
        });
      }
    }

    res.status(200).json({
      student_id: studentId,
      semester_id: semesterId || null,
      subject_count: allGrades.length,
      semesterGpa: semesterGPA,
      gpa: semesterGPA,
      status: scoreboards[0].status,
      scores: allGrades,
    });
  } catch (error) {
    console.error("Lỗi khi lấy điểm theo học kỳ:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.importStudentScores = async (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: "Vui lòng chọn file CSV" });

  const teacher_id = req.user.id;
  const filePath = req.file.path;
  const records = [];
  const inserted = [];
  const skippedStudents = [];

  const teachingClassesRes = await axios.get(`http://localhost:4000/api/teacher/tdt/${req.user.tdt_id}`);
  const teachingClasses = teachingClassesRes.data || [];

  const allStudentIds = new Set();
  teachingClasses.forEach(cls => {
    cls.class_member.forEach(studentId => {
      allStudentIds.add(studentId.toString());
    });
  });

  // Lấy danh sách môn giáo viên được dạy
  const subjectListRes = await axios.get(`http://localhost:4001/api/departments/${req.user.tdt_id}/subjects`);
  const teacherSubjects = subjectListRes.data || [];
  const teacherSubjectCodes = new Set(teacherSubjects.map((s) => s.subject_code));

  const categoryWeight = {
    "15p": 0.1,
    "1tiet": 0.2,
    giuaky: 0.2,
    cuoiky: 0.5,
  };

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
      try {
        for (const row of records) {
          try {
            const { tdt_id, subject_code, score, category, semester_code } =  row;
            const normalizedCategory =  categoryMapping[category.trim()] || category.trim();
            const weight = categoryWeight[normalizedCategory];

            if (!weight) {
              skippedStudents.push({
                tdt_id,
                reason: `Loại điểm không hợp lệ: ${category}`,
              });
              continue;
            }

            if (!teacherSubjectCodes.has(subject_code)) {
              try {
                const subjectRes = await axios.get(
                  `http://localhost:4001/api/subjects/code/${subject_code}`
                );
                const subject = subjectRes.data;
                skippedStudents.push({
                  tdt_id,
                  reason: `Bạn không có quyền nhập điểm cho môn học: ${subject.subject_name || subject_code}`,
                });
              } catch {
                skippedStudents.push({
                  tdt_id,
                  reason: `Bạn không có quyền nhập điểm cho môn học: ${subject_code}`,
                });
              }
              continue;
            }
            
            
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

            if (!semester || !semester._id) {
              console.log(`Không tìm thấy học kỳ với mã: ${semester_code}`);
              skippedStudents.push({
                mssv,
                reason: `Không tìm thấy học kỳ với mã: ${semester_code}`,
              });
              continue;
            }
   
            if (!allStudentIds.has(user._id.toString())) {
              skippedStudents.push({
                tdt_id,
                reason: "Sinh viên không nằm trong các lớp mà bạn đang dạy",
              });
              continue;
            }            

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

            const newScore = new Score({
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
        committed = true;

        if (inserted.length === 0) {
          const allReasons = skippedStudents.map((s) => s.reason);
        
          const allAreWrongClass = allReasons.every((r) =>
            r === "Sinh viên không nằm trong các lớp mà bạn đang dạy"
          );
        
          const allAreInvalidSubject = allReasons.every((r) =>
            r.startsWith("Bạn không có quyền nhập điểm cho môn học")
          );
        
          return res.status(200).json({
            message: allAreWrongClass
              ? "Tải lên thất bại: Tất cả sinh viên đều không thuộc lớp mà bạn đang dạy."
              : allAreInvalidSubject
                ? "Tải lên thất bại: Bạn không có quyền nhập điểm cho các môn học trong file."
                : "Tải lên thất bại: Không có điểm nào được nhập do dữ liệu không hợp lệ.",
            skipped: groupSkippedByReason(skippedStudents),
            warning: true,
            insertedCount: 0,
          });
        } else {
          return res.status(200).json({
            message: `Đã import ${inserted.length} điểm.`,
            insertedCount: inserted.length,
            skipped: groupSkippedByReason(skippedStudents),
          });
        }
        
      } catch (err) {
        if (!committed) {
          await session.abortTransaction();
        }
        console.error("[TRANSACTION ERROR]", err.message);
        return res
          .status(500)
          .json({ message: "Lỗi server khi import điểm", error: err.message });
      } finally {
        session.endSession();
        // Clean up uploaded file
        fs.unlinkSync(filePath);
      }
    });
};

function groupSkippedByReason(skippedList) {
  const grouped = {};
  for (const item of skippedList) {
    const reason = item.reason || "Lý do không xác định";
    if (!grouped[reason]) grouped[reason] = [];
    grouped[reason].push(item.tdt_id || "Không xác định");
  }
  return grouped;
}


function getStatusFromGPA(gpa) {
  if (gpa >= 9) return "XUẤT SẮC";
  if (gpa >= 8) return "GIỎI";
  if (gpa >= 6.5) return "KHÁ";
  if (gpa >= 5) return "TRUNG BÌNH";
  return "YẾU";
}

exports.updateScore = async (req, res) => {
  const { user_id, subject_id, semester_id, scores } = req.body;

  if (
    !user_id ||
    !subject_id ||
    !semester_id ||
    !scores ||
    typeof scores !== "object"
  ) {
    return res
      .status(400)
      .json({ message: "Thiếu dữ liệu hoặc dữ liệu không hợp lệ." });
  }

  try {
    const updateResults = [];
    let totalPoints = 0;
    let subjectScoreCount = 0;

    for (const [category, score] of Object.entries(scores)) {
      let updated = await Score.findOne({
        user_id,
        subject_id,
        semester_id,
        category,
      });

      if (!updated) {
        const subjectRes = await axios.get(
          `http://localhost:4001/api/subjects/${subject_id}`
        );
        const subjectCode = subjectRes.data.subject_code;

        updated = await Score.create({
          user_id,
          subject_id,
          semester_id,
          category,
          score,
          subject: subjectCode,
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

    const fifteenPoints = scores["15p"] || 0;
    const oneTestPoints = scores["1tiet"] || 0;
    const midtermPoints = scores["giuaky"] || 0;
    const finalPoints = scores["cuoiky"] || 0;

    const subjectGPA =
      fifteenPoints * 0.1 +
      oneTestPoints * 0.2 +
      midtermPoints * 0.2 +
      finalPoints * 0.5;

    const scoreboard = await Scoreboard.findOne({ user_id, semester_id });
    if (scoreboard) {
      const subject = scoreboard.subjects.find(
        (s) => s.subject_id.toString() === subject_id.toString()
      );
      if (subject) {
        subject.subjectGPA = subjectGPA;

        for (const updatedScore of updateResults) {
          const exists = subject.scores.some(
            (s) => s.toString() === updatedScore._id.toString()
          );
          if (!exists) {
            subject.scores.push(updatedScore._id);
          }
        }

        const totalGPA = scoreboard.subjects.reduce(
          (acc, subj) => acc + subj.subjectGPA,
          0
        );
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

exports.getStudentScoreboardByTeacher = async (req, res) => {
  const { tdt_id, studentId } = req.params;
  const { semester_id } = req.query;

  if (!semester_id) {
    return res.status(400).json({ message: "Thiếu semester_id trong query" });
  }

  try {
    // 1. Gọi sang education service để lấy MÔN GIÁO VIÊN DẠY
    const subjectRes = await axios.get(`http://localhost:4001/api/departments/${tdt_id}/subjects`);
    const teacherSubjects = subjectRes.data;

    if (!teacherSubjects.length) {
      return res.status(404).json({ message: "Giáo viên không dạy môn nào" });
    }

    // Chỉ lấy 1 môn vì giáo viên chỉ dạy 1 môn
    const subjectTaught = teacherSubjects[0]; // { subject_id, subject_code, subject_name }

    // 2. Lấy scoreboard của học sinh trong kỳ học đó
    const scoreboard = await Scoreboard.findOne({
      user_id: new mongoose.Types.ObjectId(studentId),
      semester_id: new mongoose.Types.ObjectId(semester_id)
    })
      .populate({
        path: "subjects.scores",
        select: "score category createdAt"
      })
      .lean();

    if (!scoreboard) {
      return res.status(404).json({ message: "Không tìm thấy bảng điểm của học sinh trong kỳ này" });
    }

    // 3. Tìm đúng môn giáo viên đang dạy trong bảng điểm của học sinh
    const subjectData = scoreboard.subjects.find(
      s => s.subject_id.toString() === subjectTaught.subject_id
    );

    if (!subjectData) {
      return res.status(404).json({ message: "Học sinh không học môn này trong kỳ này" });
    }

    res.json({
      student_id: scoreboard.user_id,
      semester_id: scoreboard.semester_id,
      subject: {
        subject_id: subjectTaught.subject_id,
        subject_code: subjectTaught.subject_code,
        subject_name: subjectTaught.subject_name,
        subjectGPA: subjectData.subjectGPA,
        scores: subjectData.scores
      }
    });

  } catch (err) {
    console.error("Lỗi khi lấy bảng điểm theo giáo viên:", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};