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
    -- id SERIAL PRIMARY KEY,
    -- user_id INTEGER REFERENCES users ON DELETE CASCADE,
    id INTEGER REFERENCES users ON DELETE CASCADE,
    level INTEGER DEFAULT 0,
    title TEXT DEFAULT 'Newbie',
    points INTEGER DEFAULT 0,
    quizzes_completed INTEGER DEFAULT 0
);

CREATE TABLE badges (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  badge_url TEXT NOT NULL,
  date TIMESTAMP without time zone NOT NULL
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE difficulties (
    type SERIAL PRIMARY KEY,
    difficulty TEXT NOT NULL
);

CREATE TABLE played_sessions (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id),
    difficulty_type INTEGER REFERENCES difficulties(type),
    score INTEGER NOT NULL,
    points INTEGER NOT NULL,
    date TIMESTAMP without time zone NOT NULL
);

CREATE TABLE played_counts (
    id SERIAL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id),
    difficulty_type INTEGER REFERENCES difficulties(type),
    played INTEGER NOT NULL,
    PRIMARY KEY (user_id, category_id, difficulty_type)
);

CREATE TABLE personal_best (
    category_id INTEGER REFERENCES categories(id),
    difficulty_type INTEGER REFERENCES difficulties(type),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    points INTEGER NOT NULL,
    date TIMESTAMP without time zone NOT NULL,
    PRIMARY KEY (category_id, difficulty_type, user_id)
);


CREATE TABLE leaderboard (
    category_id INTEGER REFERENCES categories(id),
    difficulty_type INTEGER REFERENCES difficulties(type),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    points INTEGER NOT NULL,
    date TIMESTAMP without time zone NOT NULL,
    PRIMARY KEY (category_id, difficulty_type)
);

CREATE TABLE folders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, 
  name VARCHAR(20) NOT NULL
);

CREATE TABLE trivia (
  id SERIAL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, question)
);
