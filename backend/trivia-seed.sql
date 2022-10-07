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


INSERT INTO stats (id, level, title, points, quizzes_completed)
VALUES (1, 14, 'Pro', 3440, 34), 
        (2, 3, 'Newbie', 605, 12);

INSERT INTO badges (user_id, badge_name, badge_url, date)
VALUES (1, 'Newbie', '/badges/newbie.gif', '2022-09-08 13:04:07-07'),
       (2, 'Newbie', '/badges/newbie.gif', '2022-09-08 13:04:07-07'),
       (1, 'Apprentice', '/badges/apprentice.gif', '2022-09-15 13:04:07-07'),
       (1, 'Pro', '/badges/pro.gif', '2022-09-27 13:04:07-07');


INSERT INTO categories (name)
VALUES ('General Knowledge'),
        ('Entertainment: Books'),
        ('Entertainment: Cartoon & Animations'),
        ('Entertainment: Film'),
        ('Entertainment: Japanese Anime & Manga'),
        ('Geography'),
        ('History'),
        ('Science & Nature'),
        ('Science: Computers'),
        ('Science: Mathematics');

INSERT INTO difficulties (difficulty)
VALUES ('easy'), ('medium'), ('hard');


INSERT INTO played_sessions (session_id, user_id, category_id, difficulty_type, score, points, date)
VALUES ('9ea32c73-2956-474d-8300-49bcee9d15c5', 1, 4, 1, 9, 70, '2022-09-08 12:20:07-07'),
        ('3e1da446-5fff-403f-8285-bdd95eddcb18', 1, 4, 1, 9, 60, '2022-09-08 13:01:07-07'),
        ('38f4f33f-2ccb-4261-b102-aa7a73f76961', 1, 4, 1, 9, 65, '2022-09-08 13:05:07-07'),
        ('d6560c4a-c272-4928-bc82-4454cb71646e', 1, 4, 2, 10, 70, '2022-09-08 13:06:07-07'),
        ('3748d1d8-e402-4bd1-bcf8-c75c9e7e2b40', 1, 4, 2, 10, 60, '2022-09-08 13:10:07-07'),
        ('662e15c7-45c5-453f-adba-a1fc36e8e631', 1, 2, 1, 9, 70, '2022-09-08 13:20:07-07'),
        ('4a3ee8fd-9410-479b-be30-21c5c7c9f4c9', 1, 2, 1, 9, 60, '2022-09-08 13:25:07-07'),
        ('1031be27-511d-4ad4-bbe4-f9e4c3d3022b', 2, 4, 1, 10, 80, '2022-09-10 13:04:07-07'),
        ('02d25fe5-ac33-4da8-8089-24d4600eb19c', 2, 4, 1, 10, 75, '2022-09-10 13:05:07-07'),
        ('3156332a-472f-42dd-b5a3-d8228e85d736', 2, 4, 2, 10, 80, '2022-09-10 13:06:07-07'),
        ('f726662f-c8f6-49ab-9676-a12c4b479674', 2, 4, 2, 10, 55, '2022-09-11 13:07:07-07'),
        ('b9cd31ec-4047-4ceb-97e8-f2c35e14e20d', 2, 2, 1, 9, 80, '2022-09-12 13:04:07-07'),
        ('971a4822-206d-4394-9030-ca3d161cf135', 2, 9, 1, 9, 80, '2022-09-13 13:04:07-07');


INSERT INTO folders (user_id, name)
VALUES (1, 'All'),
        (1, 'TEST1'),
        (1, 'TEST2'),
        (1, 'TEST3'),
        (1, 'A Very long name whi'),
        (2, 'All'),
        (2, 'TEST2');


INSERT INTO trivia (user_id, question, answer, folder_id)
VALUES (1, 'U1 Question 1', 'Answer 1', 1),
        (1, 'U1 Question 2', 'Answer 2', 1),
        (1, 'U1 Question 3', 'Answer 3', 1),
        (1, 'U1 Question 1 in TEST1', 'Answer 1', 2),
        (1, 'U1 Question 1 in TEST2', 'Answer 1', 3),
        (1, 'U1 Question 1 in A Long name', 'Answer 1', 5),
        (2, 'U2 Question 1', 'Answer 1', 6),
        (2, 'Question 1 in TEST2', 'Answer 1', 7);


INSERT INTO personal_best (category_id, difficulty_type, user_id, score, points, date)
VALUES (4, 1, 1, 9, 70, '2022-09-08 12:20:07-07'),
        (4, 2, 1, 10, 70, '2022-09-08 13:06:07-07'),
        (2, 1, 1, 9, 70, '2022-09-08 13:20:07-07'),
        (4, 1, 2, 10, 80, '2022-09-10 13:04:07-07'),
        (4, 2, 2, 10, 80, '2022-09-10 13:06:07-07'),
        (2, 1, 2, 9, 80, '2022-09-12 13:04:07-07'),
        (9, 1, 2, 9, 80, '2022-09-12 13:04:07-07');

INSERT INTO leaderboard (category_id, difficulty_type, user_id, score, points, date)
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
