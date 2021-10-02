const UsersModel = require("../models/users");
const { generateToken } = require("../middlewares/authentication");

module.exports = {
  // Crear un nuevo usuario. Se espera que la contraseña ya venga con hash
  login: async (req, res, next) => {
    const { email, password } = req.body;
    let user = await UsersModel.findOne({ email: email, password: password });

    if (user) {
      console.log(`Succesfully logged ${user.name} in`);
      // Generate an access token and send it to user
      const accessToken = generateToken(user);
      res.status(200).json({ token: accessToken });
    } else {
      res.status(401).send("Invalid credentials");
      console.log(`Invalid credentials ${user.name}:${user.password}`);
    }
  },
  register: async (req, res, next) => {
    const { email, password, name, last_name } = req.body;
    let user = new UsersModel({
      email: email,
      password: password,
      name: name,
      last_name: last_name,
      type: "Usuario",
    });

    try {
      await user.save();
      res.json(user);
      console.log(`Usuario creado con id: ${user._id}`);
    } catch (err) {
      res.status(503).send(`error: ${err.message}`);
      console.log(err.message);
    }
  },
  // Se cambia una cuenta de tipo "Usuario" a "Administrador"
  change_to_admin: (req, res, next) => {
    const email = req.body.email;
    try {
      UsersModel.updateOne(
        { email: email },
        {
          $set: {
            type: "Administrador",
          },
        },
        function (error, info) {
          if (error) {
            res.json({
              resultado: false,
              msg: "No se pudo modificar el cliente",
              err,
            });
          } else {
            res.json({
              resultado: true,
              info: info,
            });
          }
        }
      );
      res.json({ message: "update made" });
    } catch (err) {
      res.status(404).send(`error: ${err.message}`);
      console.log(err.message);
    }
  },
};