const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClassMemberSchema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'users' },
        class: { type: Schema.Types.ObjectId, ref: "classes", required: true },
        school_year: { type: String, required: true },
        is_active: { type: Boolean, default: true },
        promoted_to: { type: Schema.Types.ObjectId, ref: "classes" },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('classmembers', ClassMemberSchema);