const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.use(express.json());
var port = 3001;

// Routes
var api = require("./routes/api.js");

var dbURI = "mongodb+srv://db_user_general:ib4VLyxWGGuYS6DD@helloworld.56p3x.mongodb.net/RufinoTamayo?retryWrites=true&w=majority"
// var dbURI = "mongodb://localhost/rt_project";
mongoose.connect(dbURI);
var db = mongoose.connection;
db.once("open", function () {
  console.log("Connected to database");
});

app.use("/api", api);
app.listen(port, () => {
  console.log("Server up and running in the port: " + port);
});
