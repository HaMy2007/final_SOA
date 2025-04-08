const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScoreboardSchema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'users', required: true, unique: true },
        score: 
        [
            { type: Schema.Types.ObjectId, ref: 'scores' }
        ],
        status: 
        [
            { type: String, enum: ['passed', 'failed'], required: false }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('scoreboards', ScoreboardSchema);
