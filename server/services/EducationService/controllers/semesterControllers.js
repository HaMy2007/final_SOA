const Semester = require("../models/Semester");
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const xlsx = require('xlsx');

exports.getAllSemesters = async (req, res) => {
    const semesters = await Semester.find();
    res.status(200).json(semesters);
};

exports.importSemesters = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Vui lòng tải lên file CSV hoặc XLSX' });
      }
  
      const ext = req.file.originalname.split('.').pop();
      let data = [];
  
      if (ext === 'csv') {
        const rows = [];
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on('data', row => rows.push(row))
          .on('end', async () => {
            await saveSemesters(rows, res);
          });
      } else if (ext === 'xlsx') {
        const workbook = xlsx.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        data = xlsx.utils.sheet_to_json(sheet);
        await saveSemesters(data, res);
      } else {
        return res.status(400).json({ message: 'Định dạng file không hợp lệ' });
      }
    } catch (err) {
      console.error('Lỗi import semester:', err.message);
      res.status(500).json({ message: 'Lỗi server khi import semester' });
    }
  };
  
  async function saveSemesters(data, res) {
    const inserted = [];
  
    for (const s of data) {
      if (!s.semester_name || !s.start_date || !s.end_date) continue;
  
      const exist = await Semester.findOne({ semester_name: s.semester_name });
      if (exist) continue;
  
      const semester = new Semester({
        semester_name: s.semester_name,
        semester_code: s.semester_code,
        start_date: new Date(s.start_date),
        end_date: new Date(s.end_date)
      });
  
      const saved = await semester.save();
      inserted.push(saved);
    }
  
    res.status(200).json({
      message: `Đã thêm ${inserted.length} kỳ học`,
      inserted
    });
  }

  exports.getSemesterByCode = async (req, res) => {
    try {
      const semester = await Semester.findOne({ semester_code: req.params.code });
  
      if (!semester) {
        return res.status(404).json({ message: 'Không tìm thấy học kỳ' });
      }
  
      res.status(200).json(semester);
    } catch (err) {
      console.error('[ERROR] Lấy semester theo code:', err.message);
      res.status(500).json({ message: 'Lỗi server khi lấy học kỳ' });
    }
  };
  
  exports.getSemesterById = async (req, res) => {
    try {
      const semester = await Semester.findById(req.params.id);
  
      if (!semester) {
        return res.status(404).json({ message: 'Không tìm thấy học kỳ' });
      }
  
      res.status(200).json(semester);
    } catch (err) {
      console.error('[ERROR] Lấy semester theo _id:', err.message);
      res.status(500).json({ message: 'Lỗi server khi lấy học kỳ' });
    }
  };
  
  