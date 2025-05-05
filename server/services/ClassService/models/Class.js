const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClassSchema = new Schema(
    {
        class_name: { type: String, required: true },
        class_id: { type: String, required: true, unique: true },
        class_teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        class_member: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
        subject_teacher: [
            { type: Schema.Types.ObjectId, ref: 'users' }
        ]
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('classes', ClassSchema);