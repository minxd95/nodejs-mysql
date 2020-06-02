const mysql = require("mysql");

db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "111111",
  database: "opentutorials2"
});
//db.connect();
module.exports = db;
