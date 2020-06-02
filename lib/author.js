var url = require("url");
var template = require("./template.js");
var db = require("./db");
var qs = require("querystring");

exports.home = (request, response) => {
  db.query(`SELECT * FROM topic`, (err, topics) => {
    db.query(`SELECT * FROM author`, (err, authors) => {
      if (err) throw err;
      var title = "Authors";
      var list = template.list(topics);
      var html = template.HTML(
        title,
        list,
        `<h2>${title}</h2>${template.authorTable(authors)}
        <style>
            table {
                border-collapse : collapse;
            }
            td {
                border : 1px solid black;
            }
        </style>`,
        `<form action="/author/create_process" method="post">
            <p><input type="text" name="name" placeholder="name"></p>
            <p><textarea name="profile" placeholder="description"></textarea></p>
            <p><input type="submit" value="create"></p>
        </form>`
      );
      response.writeHead(200);
      response.end(html);
    });
  });
};
exports.create_process = (request, response) => {
  var body = "";
  request.on("data", function(data) {
    body = body + data;
  });
  request.on("end", function() {
    var post = qs.parse(body);
    db.query(
      `INSERT INTO 
        author (name,profile) 
        VALUES (?,?)`,
      [post.name, post.profile],
      (err, result) => {
        if (err) throw err;
        response.writeHead(302, { Location: `/author` });
        response.end();
      }
    );
  });
};
exports.update = (request, response) => {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  db.query(`SELECT * FROM topic`, (err, topics) => {
    db.query(`SELECT * FROM author`, (err, authors) => {
      db.query(
        `SELECT * FROM author WHERE id=?`,
        queryData.id,
        (err, author) => {
          if (err) throw err;
          var title = "Authors";
          var list = template.list(topics);
          var html = template.HTML(
            title,
            list,
            `<h2>${title}</h2>${template.authorTable(authors)}
        <style>
            table {
                border-collapse : collapse;
            }
            td {
                border : 1px solid black;
            }
        </style>`,
            `<form action="/author/update_process" method="post">
            <input type="hidden" name="id" value="${queryData.id}">
            <p><input type="text" name="name" placeholder="name" value="${author[0].name}"></p>
            <p><textarea name="profile" placeholder="description" >${author[0].profile}</textarea></p>
            <p><input type="submit" value="update"></p>
        </form>`
          );
          response.writeHead(200);
          response.end(html);
        }
      );
    });
  });
};
exports.update_process = (request, response) => {
  var body = "";
  request.on("data", function(data) {
    body = body + data;
  });
  request.on("end", function() {
    var post = qs.parse(body);
    var id = post.id;
    var name = post.name;
    var profile = post.profile;
    db.query(
      `UPDATE author SET name=?,profile=? WHERE id=?`,
      [name, profile, id],
      (err, result) => {
        if (err) throw err;
        response.writeHead(302, { Location: `/author` });
        response.end();
      }
    );
  });
};
exports.delete_process = (request, response) => {
  var body = "";
  request.on("data", function(data) {
    body = body + data;
  });
  request.on("end", function() {
    var post = qs.parse(body);
    var id = post.id;
    db.query(`DELETE FROM topic WHERE author_id=?`, id, (err, result) => {
      if (err) throw err;
      db.query(`DELETE FROM author WHERE id=?`, id, (err, result) => {
        if (err) throw err;
        response.writeHead(302, { Location: `/author` });
        response.end();
      });
    });
  });
};
