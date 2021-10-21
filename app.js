const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.use(express.json());

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

module.exports = app;