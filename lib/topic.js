var url = require("url");
var template = require("./template.js");
var db = require("./db");
var qs = require("querystring");
var sanitize = require("sanitize-html");
exports.home = (request, response) => {
  db.query(`SELECT * FROM topic`, (err, topics) => {
    if (err) throw err;
    var title = "Welcome";
    var description = "Hello, Node.js";
    var list = template.list(topics);
    var html = template.HTML(
      title,
      list,
      `<h2>${title}</h2>${description}`,
      `<a href="/create">create</a>`
    );
    response.writeHead(200);
    response.end(html);
  });
};
exports.page = (request, response) => {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  db.query(`SELECT * FROM topic`, (err, topics) => {
    if (err) throw err;
    var query = db.query(
      `SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`,
      queryData.id,
      (err, topic) => {
        if (err) throw err;
        var title = topic[0].title;
        var description = topic[0].description;
        var list = template.list(topics);
        var html = template.HTML(
          sanitize(title),
          list,
          `<h2>${title}</h2>
              <p>${sanitize(description)}</p>
              <p>by : ${topic[0].name}</p>
              <p>${topic[0].created}</p>`,
          ` <a href="/create">create</a>
                <a href="/update?id=${queryData.id}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${queryData.id}">
                  <input type="submit" value="delete">
                </form>`
        );
        console.log(query.sql);
        response.writeHead(200);
        response.end(html);
      }
    );
  });
};
exports.create = (request, response) => {
  db.query(`SELECT * FROM topic`, (err, topics) => {
    db.query(`SELECT * FROM author`, (err, authors) => {
      if (err) throw err;
      var tag = "";
      for (var i = 0; i < authors.length; i++) {
        tag += `<option value="${authors[i].id}">${authors[i].name}</option>`;
      }
      var title = "Create";
      var list = template.list(topics);
      var html = template.HTML(
        title,
        list,
        `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <select name="author">
                ${tag};
              </select>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `,
        `<a href="/create">create</a>`
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
        topic (title,description,created,author_id) 
        VALUES (?,?,NOW(),?)`,
      [post.title, post.description, post.author],
      (err, result) => {
        if (err) throw err;
        response.writeHead(302, { Location: `/?id=${result.insertId}` });
        response.end();
      }
    );
  });
};
exports.update = (request, response) => {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  db.query(`SELECT * FROM topic`, (err, results) => {
    if (err) throw err;
    db.query(`SELECT * FROM topic WHERE id=?`, queryData.id, (err, result) => {
      if (err) throw err;
      db.query(`SELECT * FROM author`, (err, authors) => {
        if (err) throw err;

        var list = template.list(results);
        var html = template.HTML(
          result[0].title,
          list,
          `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${result[0].id}">
              <p><input type="text" name="title" placeholder="title" value="${
                result[0].title
              }"></p>
              <p>
                <textarea name="description" placeholder="description">${
                  result[0].description
                }</textarea>
              </p>
              <p>
                ${template.authorSelect(authors, result[0].author_id)}
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
          `<a href="/create">create</a> <a href="/update?id=${result[0].id}">update</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
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
    var title = post.title;
    var description = post.description;
    db.query(
      `UPDATE topic SET title=?,description=?,created=NOW(),author_id=? WHERE id=?`,
      [title, description, post.author, id],
      (err, result) => {
        if (err) throw err;
        response.writeHead(302, { Location: `/?id=${id}` });
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
    db.query(`DELETE FROM topic WHERE id=?`, id, (err, results) => {
      if (err) throw err;
      response.writeHead(302, { Location: `/` });
      response.end();
    });
  });
};
