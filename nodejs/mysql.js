var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "111111",
  database: "opentutorials2"
});

connection.connect();

connection.query("SELECT * FROM topic", function(error, results, fields) {
  if (error) console.log(error);
  console.log(results);
});

connection.end();
