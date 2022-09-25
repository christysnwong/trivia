CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(25) NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    points INTEGER DEFAULT 0,
    quizzes_completed INTEGER DEFAULT 0
);

CREATE TABLE played_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users ON DELETE CASCADE,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    score TEXT NOT NULL,
    points INTEGER NOT NULL 
);

CREATE TABLE ranking (
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    user_id INTEGER REFERENCES users ON DELETE CASCADE,
    score TEXT NOT NULL,
    points INTEGER NOT NULL,
    date TEXT NOT NULL,
    PRIMARY KEY (category, difficulty)
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users ON DELETE CASCADE, 
  name TEXT NOT NULL
);

CREATE TABLE flashcards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category_id INTEGER REFERENCES categories ON DELETE CASCADE
);
