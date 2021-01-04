// app.js
const express = require("express");
const bodyParser = require("body-parser");

require("dotenv").config();
const connection = require("./connection");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World!" });
});

app.post("/bookmarks", (req, res) => {
  const { url, title } = req.body;
  if (!url || !title) {
    res.status(422).json({ error: "required field(s) missing" });
  } else
    connection.query(
      "INSERT INTO bookmark(url, title) VALUES (?,?)",
      [url, title],
      (err, results) => {
        if (err) {
          res.status(500).json({ error: err.message, sql: err.sql });
        } else {
          connection.query(
            "SELECT * FROM bookmark WHERE id = ?",
            results.insertId,
            (err, records) => {
              if (err) {
                res.status(500).json({ error: err.message, sql: err.sql });
              } else {
                res.status(201).json(records[0]);
              }
            }
          );
        }
      }
    );
});

app.get("/bookmarks/:id", (req, res) => {
  const { id } = req.params;
  connection.query(
    "SELECT * FROM bookmark WHERE id = ?",
    [id],
    (err, results) => {
      if (err || results.length === 0) {
        res.status(404).json({ error: "Bookmark not found" });
      } else {
        res.status(200).json(results[0]);
      }
    }
  );
});

module.exports = app;
