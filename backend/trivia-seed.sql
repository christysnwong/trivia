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


INSERT INTO stats (user_id)
VALUES (1), (2);