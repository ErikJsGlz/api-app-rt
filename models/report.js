const mongoose = require("mongoose");

const ReportsSchema = new mongoose.Schema({
  status: { type: String, require: true },
  title: { type: String, require: true },
  urgency_level: { type: Boolean, require: true },
  incident_type: { type: String, require: false },
  user: { type: String, require: false }, // Podría ser un usuario anónimo
  date: { type: String, require: true },
  description: { type: String, require: true },
  location: { type: String, require: false },
  photo: { type: String, require: false }, //Podría no mandar una foto
  anony_reports: { type: Boolean, require: false },
  message: { type: String, require: false }
});

module.exports = new mongoose.model("reports", ReportsSchema);
