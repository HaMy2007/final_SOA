const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SemesterSchema = new Schema(
    {
        semester_name: { type: String, required: true },
        semester_code: { type: String, required: true, unique: true },
        start_date: { type: Date, required: true },
        end_date: { type: Date, required: true }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('semesters', SemesterSchema);
