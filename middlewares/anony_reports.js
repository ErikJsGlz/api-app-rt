const ReportsModel = require("../models/report");
const UsersModel = require("../models/users");
const { secret } = require('../config');
const jwt = require("jsonwebtoken");

// Si están bloqueados los reportes anónimos y no está logueado o está bloqueado, no puede registrar un nuevo reporte
function anony_reports(req, res, next) {
    let report = ReportsModel.findOne({ anony_reports: { $in: [true, false] } });

    const accessToken = req.headers.authorization.split(" ")[1];
    payload = jwt.verify(accessToken, secret);
    let user = UsersModel.findOne({ _id: payload.id });

    if (!report.anony_reports && !req.headers.authorization || user.block) {
        console.log("No tienes autorización");
        return res.status(403).send({ message: "Necesitas loguearte primero" });
    }
    else {
        next();
    }
}

module.exports = { anony_reports }; 