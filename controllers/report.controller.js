const ReportsModel = require('../models/report');

// TODO: Crear registro de los reportes
module.exports.register_report = async (req, res) => {
    const {
        status, 
        urgency_level, 
        incident_type,
        user,
        date,
        description,
        gps,
        photo
        } = req.body;

    let report = new ReportsModel({
        status: status,
        urgency_level: urgency_level,
        incident_type: incident_type,
        user: user,
        date: date,
        description: description,
        gps: gps,
        photo: photo
    });
    try {
        await report.save();
        res.json(report);
        console.log(`Report registrador creado con id: ${report._id}`);

    }catch (err) {
        res.status(503).send(`error: ${err.message}`);
        console.log(err.message);
    }
}

// TODO: Importar todos los registros para los administradores
module.exports.import_reports_admin = async (req, res) => {
    try {
        let products = await ReportsModel.find();
        res.json(products);
    }
    catch(err) {
        res.status(503).end('error in request reports');
    }
    res.json({message:"request received"})
}

module.exports.import_reports_user = async (req, res) => {

}

module.exports.change_status = async (req, res) => {
    const id = req.body.id;
    try {
        await ReportsModel.updateOne({ _id : id}, {
            $set : {
                status : req.body.status
            }
        })
        res.json({message: "update made"});
    } catch (err) {
        res.status(404).send(`error: ${err.message}`);
        console.log(err.message);
    }
}

