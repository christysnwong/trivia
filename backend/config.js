require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "secret";
const PORT = +process.env.PORT || 3001;

const DB_URI =
  process.env.NODE_ENV === "test"
    ? "postgresql:///trivia_test"
    : process.env.DATABASE_URL || "postgresql:///trivia";


const BCRYPT_WORK_FACTOR = 12;

module.exports = {
  DB_URI,
  SECRET_KEY,
  PORT, 
  BCRYPT_WORK_FACTOR,
};