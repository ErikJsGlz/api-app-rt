const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
    email : {type: String, required: true},
    password : {type: String, require: true},
    name : {type: String, required: false},
    last_name : {type: String, required: false},
    type : {type: String, required: false}
});

module.exports = new mongoose.model('users', UsersSchema);