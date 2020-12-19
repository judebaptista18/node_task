const cors = require("cors");
bodyParser = require("body-parser");
var express = require("express");
var axios = require("axios");

const app = express();

var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "estherscan",
});

//Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());
app.options("*", cors());

// parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// test
app.get("/", async (req, res) => {
  res.send("live");
});

// test
app.get("/import", async (req, res) => {
  var values = new Array();
  var arr = new Array();
  var config = {
    method: "get",
    url:
      "https://api.etherscan.io/api?module=account&action=tokentx&address=0xecf8f87f810ecf450940c9f60066b4a7a501d6a7&startblock=0&endblock=999999999&sort=asc&apikey=37HVWYRA5WQCIGXWA7I1NGKIQRW9I8GCB3",
    headers: {
      Cookie: "__cfduid=dee9e1d3230834b7d5aca5214add7ef571608282638",
    },
  };

  axios(config)
    .then(function (response) {
      res = response.data;
      res.result.forEach((element) => {
        arr = [element.contractAddress, element.hash, element.value];
        values.push(arr);
      });
      var sql = "INSERT INTO transaction (address,hash, value) VALUES ?";
      connection.query(sql, [values], function (err) {
        if (err) throw err;
        connection.end();
      });
    })
    .catch(function (error) {
      console.log(error);
    });
});

// page one
app.get("/accounts", async (req, res) => {
  var sql =
    "SELECT address,COUNT(*) AS 'transaction_count',SUM(value)/1000000000 AS ether_value, (SUM(value)/1000000000)/0.02832*642.24 AS USD FROM `transaction` GROUP BY address ORDER by transaction_count DESC LIMIT 100";
  connection.query(sql, function (err, result, fields) {
    if (err) throw err;
    res.json(result);
  });
});

// page two
app.get("/transactions/:address", async (req, res) => {
  console.log(req.params.address);
  var sql =
    "SELECT hash,value/1000000000 AS ether_value,(value/1000000000)/0.02832*642.24 AS USD FROM `transaction` WHERE address = '" +
    req.params.address +
    "'";
  console.log(sql);
  connection.query(sql, function (err, result, fields) {
    if (err) throw err;
    res.json(result);
  });
});

port = 3001;
app.listen(port, () => console.log(`Server started on port ${port}`));
