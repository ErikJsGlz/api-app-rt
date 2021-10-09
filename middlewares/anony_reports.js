const ReportsModel = require("../models/report");

// TODO: verificar si el usuario es un usuario permitido
// Si están bloqueados los reportes anónimos y no está logueado, no puede registrar un nuevo reporte
function anony_reports(req, res, next) {
    let report = ReportsModel.findOne({anony_reports : {$in: [true, false]}});

    if (!report.anony_reports && !req.headers.authorization) {
        console.log("No tienes autorización");
        return res.status(403).send({ message: "Necesitas loguearte primero" });
    } else {
        next();
    }
}

module.exports = { anony_reports }; 