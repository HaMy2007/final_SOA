const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScoreboardSchema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'users', required: true },
        semester_id: { type: Schema.Types.ObjectId, ref: 'semesters', required: true },
        status: { type: String, required: false },
        gpa: { type: Number, required: true, default: 0},
        subjects: [
            {
                subject_id: { type: Schema.Types.ObjectId, ref: 'subjects', required: true },
                scores: [
                    { type: Schema.Types.ObjectId, ref: 'scores' }
                ],
                subjectGPA: { type: Number, default: 0 }
            }
        ]
    },
    {
        timestamps: true
    }
);
ScoreboardSchema.index({ user_id: 1, semester_id: 1 }, { unique: true });

module.exports = mongoose.model('scoreboards', ScoreboardSchema);
