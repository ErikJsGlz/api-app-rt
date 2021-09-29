
//TODO: Agregar funcionalidad de login
module.exports.login = (req, res) => {
    var user = req.body.user;
    
}

// TODO: Agregar funcionalidad de register
module.exports.register = (req, res) => {
    res.json({message:"request received"})
}

// TODO: Agregar funcionalidad de cambiar a admin
module.exports.change_to_admin = (req, res) => {
    res.json({message:"request received"});
}