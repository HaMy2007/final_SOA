const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const ObjectId = mongoose.Schema.Types.ObjectId;

const LoginInfoSchema = new mongoose.Schema(
    {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, unique: true },
        username: { type: String, required: true, unique: true },
        password: {
            type: String,
            required: true,
            set: value => bcrypt.hashSync(value, 10)
        },
        current_token: { type: String, unique: true },
        current_socket_id: { type: String, default: null }
    }, 
    { 
        timestamps: true 
    }
);

module.exports = mongoose.model('loginInfo', LoginInfoSchema);
