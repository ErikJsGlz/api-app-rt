const ReportsModel = require("../models/report");
const UsersModel = require("../models/users");
const MessagesModel = require("../models/message");

// Lista de posibles incidentes
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

  // Obtenemos un reporte específico
  get_report: async (req, res, next) => {
    const { idReporte } = req.body;

    let result = new Array();

    try {
      let report = await ReportsModel.findOne({ _id: idReporte });
      // console.log(report);
      result.push(report);

      if (report.user != "Anónimo") {
        let user = await UsersModel.findOne({ _id: report.user }, { password: 0, email: 0 });
        console.log(user);

        // Concatenamos todo en un mismo objeto json
        if (user) { result.push(user); }

      }
      res.json(result);
    }
    catch (err) {
      res.status(503).end("No se pudo concretar la petición");
      console.log("El reporte no existe")
    }

  },

  // Obtenemos la imagen de un reporte específico
  get_report_image: async (req, res, next) => {
    let photoPath = req.params.photoPath;
    const path = require('path');
    var appRoot = require('app-root-path');
    const { reportsPhotoFolder } = require('../config');
    let fullPath = path.join(appRoot + `/${reportsPhotoFolder}/` + photoPath);
    res.sendFile(fullPath);
  },

  get_summaries: async (req, res) => {
    const { user_id, incident_type, visitor_type, status, antiquity } = req.body;
    const { type } = req.user;

    const esAdmin = type === "Administrador" ? true : false;

    const filtro = {};
    if(user_id) filtro.user_id = user_id;
    if(incident_type) filtro.incident_type = incident_type;
    if(visitor_type) filtro.visitor_type = visitor_type;
    if(status) filtro.status = status;
    if(antiquity) filtro.antiquity = antiquity;

    // Esto queda pendiente ************************************

    res.status(200).json({})
  },

  // Importar todos los registros para los administradores
  import_reports_admin: async (req, res, next) => {
    try {
      // Ocupamos un registro para los registro anónimos, por eso filtramos
      let reports = await ReportsModel.find({}, { anony_reports: 0, _id: 0 });

      // Eliminamos indices vacíos
      let real_reports = reports.filter(value => JSON.stringify(value) !== '{}');

      res.json(real_reports);
    }
    catch (err) {
      res.status(503).end("No se pudo concretar la petición");
    }
  },

  // Importar todos los registros de un usuario
  import_reports_user: async (req, res, next) => {
    const payload = req.user;
    let user = await UsersModel.findOne({ _id: payload.id });

    if (user) {
      if (!user.block) {
        try {
          let reports = await ReportsModel.find({ user: user._id });
          res.json(reports);
        }
        catch (err) {
          res.status(503).end("Error en la petición");
          console.log("Hubo un error en la petición de reportes");
        }
      }
      else {
        res.status(401).send("Error: Estás bloqueado");
        console.log("El usuario está bloqueado");
      }
    }
    else {
      res.status(401).send("Error: Credencias Invalidas");
      console.log("Credenciales Invalidas");
    }
  },

  // Actualizamos el estado del reporte y/o podemos dejar un mensaje
  respond_report: async (req, res, next) => {
    // Asignación de la fecha en formato DD-MM-AA
    var today = new Date();
    var date = today.getDate() + "-" + (today.getMonth() + 1) + "-" + today.getFullYear();
    var time = today.getHours() + ":" + today.getMinutes();

    // Verificamos que el usuario es Administrador
    const payload = req.user;
    let admin = await UsersModel.findOne({ _id: payload.id });

    // Buscamos el reporte
    const { idReporte, new_message, status } = req.body;
    let report = await ReportsModel.findOne({ _id: idReporte });

    if (report) {
      try {
        // Se crea el modelo
        let message = new MessagesModel({
          id_user: admin._id,
          name: admin.name,
          last_name: admin.last_name,
          id_report: report._id,
          message: new_message,
          date: date + " ; " + time,
        });

        // Si es admin se cambia el status y se registra en el mensaje
        if (admin.type == "Administrador" && status) {
          report.status = status;
          message.is_admin = true;
        }

        await report.save();
        await message.save();

        res.json({ message: "El mensaje se pudo registrar" })
      }
      catch (err) {
        res.status(400).send("Error: No se puedo cambiar el estado del Reporte ni se pudo dejar el mensaje");
        console.log("Reporte sin cambiar de estado");
      }
    }
    else {
      res.status(400).send("No existe el Reporte");
      console.log("Reporte inexistente");
    }
  },

  get_message_report: async (req, res, next) => {
    const { idReporte } = req.body;
    let report = await ReportsModel.findOne({ _id: idReporte });

    if (report) {
      let messages = await MessagesModel.find({ id_report: idReporte });
      if (messages) {
        res.json(messages);
      }
      else {
        res.status(400).send("No existen mensajes para ese reporte");
        console.log("Reporte sin mensajes");
      }
    }
    else {
      res.status(400).send("No existe el Reporte");
      console.log("Reporte inexistente");
    }
  },


};