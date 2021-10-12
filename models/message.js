const mongoose = require("mongoose");

const MessagesSchema = new mongoose.Schema({
    id_user: { type: String, require: true },
    message: { type: String, require: true },
    is_admin: { type: Boolean, require: false }
});

module.exports = new mongoose.model("messages", MessagesSchema);