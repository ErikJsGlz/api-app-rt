const UsersModel = require("../models/users");
const ReportsModel = require("../models/report");
const { generateToken } = require("../middlewares/authentication");
var sha256 = require('js-sha256');

function emailIsValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = {

  // Pedimos un usuario mediante su correo, y devolvemos: nombre, apellido y idUsuario
  get_user: async (req, res, next) => {
    const email = req.user.email;
    let user = await UsersModel.findOne({ email: email }, { password: 0 });

    if (user) {
      res.status(200).json(user);
    }
    else {
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
    }
    else {
      res.status(401).send("Error: Credencias Invalidas");
      console.log(`Credenciales invalidas`);
    }
  },

  // Se registra un nuevo usuario
  register: async (req, res, next) => {
    const { email, password, repeated_password, name, last_name } = req.body;

    let hash_password = sha256.create();
    hash_password.update(password);
    hash_password.hex();

    if (emailIsValid(email)) {
      // Validamos si ya existe el usuario dentro de la base de datos, si no, se crea
      let isRepeatedUser = await UsersModel.findOne({ email: email });

      if (!isRepeatedUser) {
        if (password == repeated_password) {
          let user = new UsersModel({
            email: email,
            password: hash_password,
            name: name,
            last_name: last_name,
            type: "Visitante",
            block: false
          });

          try {
            await user.save();
            res.json(user);
            console.log(`Usuario creado con id: ${user._id}`);
          }
          catch (err) {
            res.status(503).send(`Error: ${err.message}`);
            console.log(err.message);
          }
        }
        else {
          res.status(400).send(`Error: Las contraseñas no coinciden`);
          console.log("Contraseñas no coinciden");
        }
      }
      else {
        res.status(400).send(`Error: El usuario ya existente`);
        console.log("Usuario ya existente en la base de datos");
      }

    }
    else {
      res.status(400).send(`Error: No es un correo válido`);
      console.log("El correo no tiene un formato adecuado");
    }


  },

  // Se cambia una cuenta de tipo "Usuario" a "Administrador"
  change_to_admin: async (req, res, next) => {
    // Obtenemos el id
    const payload = req.user;

    const { email, add_or_delete } = req.body;

    //Verificamos si es admin y si es el Principal
    let admin = await UsersModel.findOne({ _id: payload.id });
    if (admin.type == "Administrador" && admin.main) {
      let new_admin = await UsersModel.findOne({ email: email });

      if (new_admin) {
        new_admin.main = false;
        // Si es true, entonces se actualiza a administrador, de lo contrario baja su categoría a visitante
        if (add_or_delete) {
          try {
            new_admin.type = "Administrador";
            await new_admin.save();
            res.json({ message: "Se actualizó a Administrador" });
            console.log(`El usuario: ${new_admin._id} es ahora Administrador`);
          }
          catch (err) {
            res.status(400).send("Error: No se pudo actualizar al usuario");
            console.log(`No se pudo actualizar el usuario con el ${new_admin._id}`);
          }
        }
        else {
          try {
            new_admin.type = "Visitante";
            await new_admin.save()
            res.json({ message: "Se actualizó a Visitante" });
            console.log(`El usuario: ${new_admin._id} es ahora Visitante`);
          }
          catch (err) {
            res.status(400).send("Error: No se pudo actualizar al usuario");
            console.log(`No se pudo actualizar el usuario con el ${new_admin._id}`);
          }
        }

      }
      else {
        res.status(400).send("Error: No existe el usuario");
        console.log("Usuario inexistente");
      }
    }
    else {
      res.status(403).send("Error: No tienes permisos");
      console.log("No es un Administrador o no es el Administrador Principal");
    }
  },

  get_admins: async (req, res, next) => {
    try {
      let admins = await UsersModel.find({ type: "Administrador" })
      res.status(200).json(admins);
    }
    catch (err) {
      res.status(503).send(`Error: ${err.message}`);
      console.log(err.message);
    }
  },

  // Cambiamos la contraseña
  reset_password: async (req, res, next) => {
    const payload = req.user;
    const { password, new_password, repeated_new_password } = req.body;
    let hash_password_original = sha256.create();
    hash_password_original.update(password);
    hash_password_original.hex();

    // Validamos si son contraseñas iguales, si existe el usuario y si coinciden con el usuario
    if (new_password == repeated_new_password) {
      let user = await UsersModel.findOne({ _id: payload.id });

      if (user) {
        if (hash_password_original == user.password) {
          try {
            let hash_password = sha256.create();
            hash_password.update(new_password);
            hash_password.hex();

            user.password = hash_password;
            await user.save();
            res.json({ message: "Actualización hecha" });
            console.log(`Contraseña actualizada del usuario: ${user._id}`);
          }
          catch (err) {
            res.status(503).send(`Error: ${err.message}`);
            console.log(err.message);
          }
        }
        else {
          res.status(400).send("Error: No coinciden contraseña");
          console.log("No coinciden contraseñas");
        }
      }
      else {
        res.status(400).send("Error: No existe el usuario");
        console.log("Usuario inexistente");
      }
    }
    else {
      res.status(400).send("Error: Nuevas contraseñas no coinciden");
      console.log("No coinciden las nuevas contraseñas");
    }
  },

  // Cambiamos el admin principal
  new_main_admin: async (req, res, next) => {
    // Obtenemos el id
    const payload = req.user;

    const { email } = req.body;

    let mainAdmin = await UsersModel.findOne({ _id: payload.id });
    if (mainAdmin.type == "Administrador" && mainAdmin.main) {
      let new_main_admin = await UsersModel.findOne({ email: email });

      if (new_main_admin.type == "Administrador") {
        try {
          new_main_admin.main = true;
          mainAdmin.main = false;

          await new_main_admin.save();
          await mainAdmin.save();

          res.json({ message: "Se cambió el Administrador Principal" });
          console.log(`El usuario: ${new_main_admin._id} es ahora Administrador Principal`);
        }
        catch (err) {
          res.status(400).send("Error: No se pudo actualizar al usuario");
          console.log(`No se pudo actualizar el usuario con el ${new_main_admin._id}`);
        }
      }
      else {
        res.status(400).send("Error: No existe el usuario");
        console.log("Usuario inexistente");
      }

    }
    else {
      res.status(403).send("Error: No tienes permisos");
      console.log("El usuario no tiene permisos");
    }
  },

  // Permitimos o bloqueamos los reportes anónimos
  block_anony_reports: async (req, res, next) => {
    // Obtenemos el id y buscamos el usuario
    const payload = req.user;
    let user = await UsersModel.findOne({ _id: payload.id });
    const { block } = req.body;

    if (user.type == "Administrador") {
      try {
        // Encontramos el elemento de reportes anónimos y lo cambiamos según sea el caso
        let report = await ReportsModel.findOne({ anony_reports: { $in: [true, false] } });

        if (block) { report.anony_reports = true; }
        else { report.anony_reports = false; }
        await report.save();

        res.json({ message: "Cambió el estado de los reportes anónimos a " + block });
        console.log("Reportes anónimos: " + block);
      }
      catch (err) {
        res.status(400).send("Error: No se pudo actualizar el estado de los reportes anónimos");
        console.log("Los reportes anónimos tienen estado: " + block);
      }
    }
    else {
      res.status(403).send("Error: No tienes permisos");
      console.log("El usuario no tiene permisos");
    }
  },

  block_user: async (req, res, next) => {
    // Obtenemos el id y buscamos el admin
    const payload = req.user;
    let admin = await UsersModel.findOne({ _id: payload.id });
    const { user_id } = req.body;

    if (admin.type == "Administrador") {
      try {
        let user = await UsersModel.findOne({ _id: user_id });

        // Solo se pueden bloquear usuarios visitantes y no a otros administrador
        if (user.type == "Visitante") {
          user.block = true;
          await user.save();

          res.json({ message: "El usuario: " + user.id + " ahora está bloqueado" });
          console.log(user.id + " está ahora bloqueado");
        }
        else {
          res.json({ message: "El usuario: " + user.id + " es Administrador y no se puede bloquear" });
          console.log(user.id + " es Administrador");
        }
      }
      catch (err) {
        res.status(400).send("Error: No se puedo cambiar el estado del usuario");
        console.log("Usuario sin cambiar de estado");
      }
    }
    else {
      res.status(403).send("Error: No tienes permisos");
      console.log("El usuario no tiene permisos");
    }
  },
};
