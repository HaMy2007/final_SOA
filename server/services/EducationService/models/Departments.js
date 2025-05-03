const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DepartmentSchema = new Schema(
    {
        name: { type: String, required: true },
        code: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        phone_number: { type: String, required: true },
        officeLocation: { type: String, required: true },
        headofDepartment:  { type: Schema.Types.ObjectId, ref: 'users' },
        members:
        [
            { type: Schema.Types.ObjectId, ref: 'users' }
        ],
        subjects:
        [
            { type: Schema.Types.ObjectId, ref: 'subjects' }
        ],
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('departments', DepartmentSchema);
