"use strict";

// const { Client } = require("pg");
const { Pool } = require("pg");
const { DB_URI } = require("./config");

// const db = new Client(DB_URI);
// db.connect();

const db = new Pool({
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 2000,
  connectionString: DB_URI
});


db.connect((err, client, release) => {
  if (err) {
    return console.error("Error acquiring client", err.stack);
  }
  client.query("SELECT NOW()", (err, result) => {
    release();
    if (err) {
      return console.error("Error executing query", err.stack);
    }
    console.log(result.rows);
  });
});




module.exports = db;
