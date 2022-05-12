CREATE DATABASE highscore;

CREATE TABLE score (
    id INTEGER GENERATED ALWAYS AS IDENTITY,
    game_id INTEGER NOT NULL,
    player VARCHAR(50) NOT NULL,
    created_at DATE NOT NULL DEFAULT CURRENT_DATE,
    points INTEGER NOT NULL,
      PRIMARY KEY (id),
    FOREIGN KEY (game_id)
        REFERENCES game (id)
)

CREATE TABLE game (
    id INTEGER GENERATED ALWAYS AS IDENTITY,
    title VARCHAR(50) NOT NULL,
    description VARCHAR(250) NOT NULL,
    image_url VARCHAR(200) NOT NULL,
    release_date DATE NOT NULL DEFAULT CURRENT_DATE,
    url_slug VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE(url_slug)
)

CREATE TABLE genre (
    id INTEGER GENERATED ALWAYS AS IDENTITY,
    genre VARCHAR(50) NOT NULL,
    PRIMARY KEY (id)
)

CREATE TABLE game_genre (
    id INTEGER GENERATED ALWAYS AS IDENTITY,
    game_id INTEGER NOT NULL,
    genre_id INTEGER NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (game_id)
        REFERENCES game (id)
        ON DELETE CASCADE,
        FOREIGN KEY (genre_id)
        REFERENCES genre (id)
        ON DELETE CASCADE
)