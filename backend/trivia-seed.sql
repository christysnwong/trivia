INSERT INTO users (username, password, first_name, last_name, email, is_admin)
VALUES ('testuser',
        '$2b$12$kEfA60b9X/CfmzNRaCJcDeqskbZIz3.xfcqVp9I8o8C.7qLv062l.',
        'Test',
        'User',
        'test@test.com',
        FALSE),
       ('testadmin',
        '$2b$12$M2Z1FVxM19rOTCy5imT4AevaIOXjypXdVB0BwDBDySI0x/yZhVpX6',
        'Test',
        'Admin',
        'testadmin@test.com',
        TRUE);


INSERT INTO stats (id)
VALUES (1), (2);

INSERT INTO categories (name)
VALUES ('General Knowledge'),
        ('Entertainment: Books'),
        ('Entertainment: Cartoon and Animations'),
        ('Entertainment: Film'),
        ('Entertainment: Japanese Anime and Manga'),
        ('Geography'),
        ('History'),
        ('Science & Nature'),
        ('Science: Computers'),
        ('Science: Math');

INSERT INTO difficulties (difficulty)
VALUES ('easy'), ('medium'), ('hard');


INSERT INTO played_sessions (category_id, difficulty_type, user_id, score, points, date)
VALUES (4, 1, 1, 9, 70, '2022-09-08 12:20:07-07'),
        (4, 1, 1, 9, 60, '2022-09-08 13:01:07-07'),
        (4, 1, 1, 9, 65, '2022-09-08 13:05:07-07'),
        (4, 2, 1, 10, 70, '2022-09-08 13:06:07-07'),
        (4, 2, 1, 10, 60, '2022-09-08 13:10:07-07'),
        (2, 1, 1, 9, 70, '2022-09-08 13:20:07-07'),
        (2, 1, 1, 9, 60, '2022-09-08 13:25:07-07'),
        (4, 1, 2, 10, 80, '2022-09-10 13:04:07-07'),
        (4, 1, 2, 10, 75, '2022-09-10 13:05:07-07'),
        (4, 2, 2, 10, 80, '2022-09-10 13:06:07-07'),
        (4, 2, 2, 10, 55, '2022-09-11 13:07:07-07'),
        (2, 1, 2, 9, 80, '2022-09-12 13:04:07-07'),
        (9, 1, 2, 9, 80, '2022-09-13 13:04:07-07');



INSERT INTO folders (user_id, name)
VALUES (1, 'All'),
        (1, 'TEST1'),
        (2, 'All'),
        (2, 'TEST2');


INSERT INTO trivia (user_id, question, answer, folder_id)
VALUES (1, 'Question 1', 'Answer 1', 1),
        (1, 'Question 2', 'Answer 2', 1),
        (1, 'Question 3', 'Answer 3', 1),
        (1, 'Question 1 in TEST1', 'Answer 1', 2),
        (2, 'Question 1', 'Answer 1', 3),
        (2, 'Question 1 in TEST2', 'Answer 1', 4);


INSERT INTO personal_best (category_id, difficulty_type, user_id, score, points, date)
VALUES (4, 1, 1, 9, 70, '2022-09-08 12:20:07-07'),
        (4, 2, 1, 10, 70, '2022-09-08 13:06:07-07'),
        (2, 1, 1, 9, 70, '2022-09-08 13:20:07-07'),
        (4, 1, 2, 10, 80, '2022-09-10 13:04:07-07'),
        (4, 2, 2, 10, 80, '2022-09-10 13:06:07-07'),
        (2, 1, 2, 9, 80, '2022-09-12 13:04:07-07'),
        (9, 1, 2, 9, 80, '2022-09-12 13:04:07-07');

INSERT INTO global_scores (category_id, difficulty_type, user_id, score, points, date)
VALUES (4, 1, 2, 10, 80, '2022-09-10 13:04:07-07'),
        (4, 2, 2, 10, 80, '2022-09-10 13:06:07-07'),
        (2, 1, 2, 9, 80, '2022-09-12 13:04:07-07'),
        (9, 1, 2, 9, 80, '2022-09-12 13:04:07-07');


INSERT INTO played_counts (user_id, category_id, difficulty_type, played)
VALUES (1, 4, 1, 2),
       (1, 4, 2, 1),
       (2, 4, 1, 1),
       (2, 4, 2, 1),
       (2, 2, 1, 1),
       (2, 9, 1, 1);
