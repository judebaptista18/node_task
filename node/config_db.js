"user strict";
var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "",
  password: "",
  database: "estherscan",
});

connection.connect();
module.exports = connection;
