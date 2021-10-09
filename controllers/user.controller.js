const UsersModel = require("../models/users");
const { generateToken } = require("../middlewares/authentication");
const { secret } = require('../config');
const jwt = require("jsonwebtoken");
var sha256 = require('js-sha256');

module.exports = {

  // Pedimos un usuario mediante su correo, y devolvemos: nombre, apellido y idUsuario
  get_user: async (req, res, next) => {
    const { email } = req.body;
    let user = await UsersModel.findOne({ email: email });

    if (user) {
      res.status(200).json({ name: user.name, last_name: user.last_name, idUsuario: user.idUsuario });
    } else {
      res.status(400).send("No existe el usuario");
      console.log("Usuario inexistente");
    }
  },

  // Crear un nuevo usuario
  login: async (req, res, next) => {
    const { email, password } = req.body;

    let hash_password = sha256.create();
    hash_password.update(password);
    hash_password.hex();

    let user = await UsersModel.findOne({ email: email, password: hash_password });

    if (user) {
      console.log(`Succesfully logged ${user.name} in`);
      // Generate an access token and send it to user
      const accessToken = generateToken(user);
      res.status(200).json({ token: accessToken, idUsuario: user.idUsuario });
    } else {
      res.status(401).send("Error: Invalid credentials");
      console.log(`Invalid credentials`);
    }
  },

  // Se registra un nuevo usuario
  register: async (req, res, next) => {
    const { email, password, repeated_password, name, last_name } = req.body;

    let hash_password = sha256.create();
    hash_password.update(password);
    hash_password.hex();

    if (password == repeated_password) {
      let user = new UsersModel({
        email: email,
        password: hash_password,
        name: name,
        last_name: last_name,
        type: "Visitante",
      });

      // Validamos si ya existe el usuario dentro de la base de datos, si no, se crea
      repeat_user = await UsersModel.findOne({ email: email });
      if (!repeat_user) {
        try {
          await user.save();
          res.json(user);
          console.log(`Usuario creado con id: ${user._id}`);
        } catch (err) {
          res.status(503).send(`Error: ${err.message}`);
          console.log(err.message);
        }
      } else {
        res.status(400).send("Error: Ya hay un usuario con ese correo");
        console.log("Usuario repetido");
      }
    } else {
      res.status(400).send(`Error: Las contraseñas no coinciden`);
      console.log("Contraseñas no coinciden");
    }
  },

  // Se cambia una cuenta de tipo "Usuario" a "Administrador"
  change_to_admin: async (req, res, next) => {
    // Obtenemos el id
    const accessToken = req.headers.authorization.split(" ")[1];
    payload = jwt.verify(accessToken, secret);

    const { email, addOrDelete } = req.body;

    //Verificamos si es admin y si es el Principal
    let admin = await UsersModel.findOne({ _id: payload.id });
    if (admin.type == "Administrador" && admin.main) {
      let new_admin = await UsersModel.findOne({ email: email });

      if (new_admin) {
        // Si es true, entonces se actualiza a administrador, de lo contrario baja su categoría a visitante
        if (addOrDelete) {
          try {
            new_admin.type = "Administrador";
            await new_admin.save();
            res.json({ message: "Se actualizó a Administrador" });
            console.log(`El usuario: ${new_admin._id} es ahora Administrador`);
          } catch (err) {
            res.status(400).send("Error: No se pudo actualizar al usuario");
            console.log(`No se pudo actualizar el usuario con el ${new_admin._id}`);
          }
        } else {
          try {
            new_admin.type = "Visitante";
            await new_admin.save()
            res.json({ message: "Se actualizó a Visitante" });
            console.log(`El usuario: ${new_admin._id} es ahora Visitante`);
          } catch (err) {
            res.status(400).send("Error: No se pudo actualizar al usuario");
            console.log(`No se pudo actualizar el usuario con el ${new_admin._id}`);
          }
        }
      } else {
        res.status(400).send("Error: No existe el usuario");
        console.log("Usuario inexistente");
      }


    } else {
      res.status(403).send("Error: No tienes permisos");
      console.log("No es un Administrador o no es el Administrador Principal");
    }
  },

  // Cambiamos la contraseña
  reset_password: async (req, res, next) => {
    const { idUsuario,
      password,
      new_password,
      repeated_new_password } = req.body;

    // Validamos si son contraseñas iguales, si existe el usuario y si coinciden con el usuario
    if (new_password == repeated_new_password) {
      let user = await UsersModel.findOne({ _id: idUsuario });

      if (user) {
        if (password == user.password) {
          try {
            let hash_password = sha256.create();
            hash_password.update(new_password);
            hash_password.hex();

            user.password = hash_password;
            await user.save();
            res.json({ message: "Actualización hecha" });
            console.log(`Contraseña actualizada del usuario: ${user._id}`);
          } catch (err) {
            res.status(503).send(`Error: ${err.message}`);
            console.log(err.message);
          }
        } else {
          res.status(400).send("Error: No coinciden contraseña");
          console.log("No coinciden contraseñas");
        }
      } else {
        res.status(400).send("Error: No existe el usuario");
        console.log("Usuario inexistente");
      }
    } else {
      res.status(400).send("Error: Nuevas contraseñas no coinciden");
      console.log("No coinciden las nuevas contraseñas");
    }
  },

  // Cambiamos el admin principal
  new_main_admin: async (req, res, next) => {
    // Obtenemos el id
    const accessToken = req.headers.authorization.split(" ")[1];
    payload = jwt.verify(accessToken, secret);

    const { email } = req.body;

    let mainAdmin = await UsersModel.findOne({ _id : payload.id});
    if (mainAdmin.type == "Administrador" && mainAdmin.main) {
      let new_main_admin = await UsersModel.findOne({ email : email});

      if (new_main_admin) {
        try {
          new_main_admin.main = true;
          mainAdmin.main = false;
          await new_main_admin.save();
          await mainAdmin.save();
          res.json({message : "Se cambió el Administrador Principal"});
          console.log(`El usuario: ${new_main_admin._id} es ahora Administrador Principal`);
        } catch (err) {
          res.status(400).send("Error: No se pudo actualizar al usuario");
            console.log(`No se pudo actualizar el usuario con el ${new_main_admin._id}`);
        }
      } else {
        res.status(400).send("Error: No existe el usuario");
        console.log("Usuario inexistente");
      }
      
    } else {
      res.status(403).send("Error: No tienes permisos");
      console.log("El usuario no tiene permisos");
    }
  },
};
