// const app = require("./app");

// app.listen(3000, function () {
//   console.log("Server starting on port 3000");
// });

"use strict";

const app = require("./app");
const { PORT } = require("./config");

app.listen(PORT, function () {
  console.log(`Started on http://localhost:${PORT}`);
});
