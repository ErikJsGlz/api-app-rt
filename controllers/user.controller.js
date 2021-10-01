const UsersModel = require('../models/users');

// TODO: Añadir lo de JWT

//TODO: Agregar funcionalidad de login
module.exports.login = (req, res) => {
    var user = req.body.user;
    
}

module.exports.register = async (req, res) => {
    const { email, password, name, last_name } = req.body
    let user = new UsersModel({email: email, password: password, name: name, last_name: last_name, type: "Usuario"});

    try {
        await user.save();
        res.json(user);
        console.log(`Usuario creado con id: ${user._id}`);
    } 
    catch (err) {
        res.status(503).send(`error: ${err.message}`);
        console.log(err.message);
    }
}

module.exports.change_to_admin = (req, res) => {
    const email = req.body.email;
    try {
        UsersModel.updateOne({ email: email }, {
                $set: {
                    type: "Administrador"
                }
            },
            function(error, info) {
                if (error) {
                    res.json({
                        resultado: false,
                        msg: 'No se pudo modificar el cliente',
                        err
                    });
                } 
                else {
                    res.json({
                        resultado: true,
                        info: info
                    })
                }
            }
        )
        res.json({message: "update made"});
    }
    catch(err) {
        res.status(404).send(`error: ${err.message}`);
        console.log(err.message);
    }
}