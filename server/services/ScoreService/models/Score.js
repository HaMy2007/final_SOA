const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScoreSchema = new Schema(
    {
        score: { type: Number, required: true },
        subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'subject', required: true },
        subject: { type: String, require: true },
        semester_id: { type: mongoose.Schema.Types.ObjectId, ref: 'semester', required: true },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('score', ScoreSchema);
