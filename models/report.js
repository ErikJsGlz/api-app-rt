const mongoose = require('mongoose');

const ReportsSchema = new mongoose.Schema({
    status: {type: String, require: true},
    urgency_level: {type: String, require: true},
    incident_type: {type: String, require: true},
    user: {type: String, require: false}, // Podría ser un usuario anónimo
    date: {type: String, require: true},
    description: {type: String, require: true},
    gps: {type: String, require: true},
    photo: {type: String, require: false} //Podría no mandar una foto

});

module.exports = new mongoose.model('reports', ReportsSchema);