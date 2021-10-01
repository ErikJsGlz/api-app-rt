const ReportsModel = require("../models/report");
const UsersModel = require("../models/users");

// TODO: Añadir lo de JWT

// Crear registro de los reportes
module.exports.register_report = async (req, res) => {
  // Dado que solo se envía el correo, hacemos una querie para obtener el id_user
  const email = req.body.email;
  let user = await UsersModel.findOne({ email: email });

  // Asignación de la fecha en formato DD-MM-AA
  var today = new Date();
  var date = today.getDate() + "-" + (today.getMonth() + 1) + "-" + today.getFullYear();

  // Extraemos los datos de req.body y armamos el modelo
  const { status, urgency_level, incident_type, description, gps, photo } = req.body;
  let report = new ReportsModel({
    status: status,
    urgency_level: urgency_level,
    incident_type: incident_type,
    user: "Anónimo",
    date: date,
    description: description,
    gps: gps,
    photo: photo,
  });
  // Si se dio un correo y concuerda con un usuario, se registra el usuario en el reporte
  if (user) {
    report.user = user._id;
  }

  try {
    await report.save();
    res.json(report);
    console.log(`Report registrador creado con id: ${report._id}`);
  } catch (err) {
    res.status(503).send(`error: ${err.message}`);
    console.log(err.message);
  }
};

// Importar todos los registros para los administradores
module.exports.import_reports_admin = async (req, res) => {
  try {
    let reports = await ReportsModel.find();
    res.json(reports);
  } catch (err) {
    res.status(503).end("error in request reports");
  }
};

// Importar todos los registros de un usuario
module.exports.import_reports_user = async (req, res) => {
  const email = req.body.email;
  let user = await UsersModel.findOne({ email: email });

  try {
    let reports = await ReportsModel.find({ user: user._id });
    res.json(reports);
  } catch (err) {
    res.status(503).end("error in request reports");
  }
};

module.exports.change_status = async (req, res) => {
  const id = req.body.id;
  try {
    await ReportsModel.updateOne(
      { _id: id },
      {
        $set: {
          status: req.body.status,
        },
      }
    );
    res.json({ message: "update made" });
  } catch (err) {
    res.status(404).send(`error: ${err.message}`);
    console.log(err.message);
  }
};
