\echo 'Delete and recreate trivia db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE trivia;
CREATE DATABASE trivia;
\connect trivia

\i trivia-schema.sql
\i trivia-seed.sql

\echo 'Delete and recreate trivia_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE trivia_test;
CREATE DATABASE trivia_test;
\connect trivia_test

\i trivia-schema.sql
