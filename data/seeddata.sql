INSERT INTO game (
    title,
    description,
    image_url,
    release_date,
    url_slug
) VALUES
(
    'Tetris',
    'Lorem ipsum dolor',
    'https://via.placeholder.com/320x480.png',
    '2012-08-10',
    'tetris'
);

INSERT INTO score (
    game_id,
    player,
    created_at,
    points
) VALUES
(
    '1',
    'John Doe',
    '2022-05-05',
    '1337'
);

INSERT INTO genre (
    genre
) VALUES
(
    'Puzzle'
);

INSERT INTO game_genre (
    game_id,
    genre_id
) VALUES
(
    '1',
    '1'
);




