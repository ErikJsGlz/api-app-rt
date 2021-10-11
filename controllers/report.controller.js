const ReportsModel = require("../models/report");
const UsersModel = require("../models/users");

const incidents = [
  'Luminarias',
  'Basura',
  'Perro sin correa',
  'Heces de perro',
  'Ramas obstruyendo paso',
  'Hierba crecida',
  'Desperfecto en instalaciones',
  'Mal uso de las instalaciones o falta al reglamento',
  'Otro'];

module.exports = {
  // Crear registro de los reportes
  register_report: async (req, res, next) => {
    // Asignación de la fecha en formato DD-MM-AA
    var today = new Date();
    var date = today.getDate() + "-" + (today.getMonth() + 1) + "-" + today.getFullYear();
    var time = today.getHours() + ":" + today.getMinutes();

    // Extraemos los datos de req.body y armamos el modelo
    const { title, urgency_level, incident_type, description } = req.body;

    let report = new ReportsModel({
      status: "Enviado",
      title: title,
      user: "Anónimo",
      date: date + " ; " + time,
      description: description,
    });

    // Verificamos si el tipo incidente es correcto o existente, si no devolvemos un error
    if (incidents.includes(incident_type)) {
      report.incident_type = incident_type;

      // En dado caso que sea otro se registra el nivel de urgencia según el enviado
      if (incident_type = "Otro") { report.urgency_level = urgency_level; }
      else { report.urgency_level = false; }
    }
    else {
      res.status(503).end("Error: No se pudo concretar el registro del reporte");
      console.log("El tipo de incidente no es válido");
    }

    // Si lo registra un usuario, estamos seguros, que tiene un id, entonces se relaciona con el reporte
    const payload = req.user;
    if (payload) {
      const user = await UsersModel.findOne({ _id: payload.id });
      if (user) { report.user = user._id; }
    }

    // Si tiene datos de ubicación lo asignamos
    if (req.body.location) { report.location = req.body.location; }

    // Si tiene fotos, le almacenamos la dirección
    if (req.file) { report.photo = req.file; }

    try {
      await report.save();
      res.status(201).json(report);
      console.log(`Reporte registrador, creado con id: ${report._id}`);
    }
    catch (err) {
      res.status(503).send(`error: ${err.message}`);
      console.log(err.message);
    }
  },

  // Importar todos los registros para los administradores
  import_reports_admin: async (req, res, next) => {
    try {
      let reports = await ReportsModel.find();
      res.json(reports);
    }
    catch (err) {
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
    }
    catch (err) {
      res.status(503).end("error in request reports");
    }
  },

  //  Cambiamos el status de un reporte
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
    }
    catch (err) {
      res.status(404).send(`error: ${err.message}`);
      console.log(err.message);
    }
  }

}

// TODO: Añadir lo del almacenamiento de las fotos