const ReportsModel = require("../models/report");
const UsersModel = require("../models/users");

module.exports = {
  // Crear registro de los reportes
  register_report: async (req, res, next) => {
    // Dado que solo se envía el correo, hacemos una querie para obtener el id_user
    const email = req.body.email;
    let user = await UsersModel.findOne({ email: email });

    // Asignación de la fecha en formato DD-MM-AA
    var today = new Date();
    var date = today.getDate() + "-" + (today.getMonth() + 1) + "-" + today.getFullYear();
    var time = today.getHours() + ":" + today.getMinutes();

    // Extraemos los datos de req.body y armamos el modelo
    const { status, urgency_level, incident_type, description, gps, photo } = req.body;
    let report = new ReportsModel({
      status: status,
      urgency_level: urgency_level,
      incident_type: incident_type,
      user: "Anónimo",
      date: date + " ; " + time,
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
  },
  // Importar todos los registros para los administradores
  import_reports_admin: async (req, res, next) => {
    try {
      let reports = await ReportsModel.find();
      res.json(reports);
    } catch (err) {
      res.status(503).end("error in request reports");
    }
  },
  // Importar todos los registros de un usuario
  import_reports_user: async (req, res, next) => {
    const email = req.body.email;
    let user = await UsersModel.findOne({ email: email });

    try {
      let reports = await ReportsModel.find({ user: user._id });
      res.json(reports);
    } catch (err) {
      res.status(503).end("error in request reports");
    }
  },

  
  change_status: async (req, res, next) => {
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
  }

}

// TODO: Añadir lo del almacenamiento de las fotos