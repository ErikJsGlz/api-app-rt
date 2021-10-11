const ReportsModel = require("../models/report");
const UsersModel = require("../models/users");
const { secret } = require('../config');
const jwt = require("jsonwebtoken");

// Si están bloqueados los reportes anónimos y no está logueado o está bloqueado, no puede registrar un nuevo reporte
async function anony_reports(req, res, next)  {
    const report = await ReportsModel.findOne({ anony_reports: { $in: [true, false] } });
    // const report = await ReportsModel.find();
    console.log(report);

    if (!report.anony_reports || !req.headers.authorization) {
        if (req.headers.authorization) {
            const accessToken = req.headers.authorization.split(" ")[1];
            payload = jwt.verify(accessToken, secret);
            const user = await UsersModel.findOne({ _id: payload.id });
            if (!user.block) {
                req.user = payload;
                next();
            }
            else {
                return res.status(401).send({ message: "Estás bloqueado" });
            }
        }
        else {
            next();
        }
    }
    else {
        return res.status(401).send({ message: "Reportes anónimos bloqueados" });
    }  
}

module.exports = { anony_reports }; 