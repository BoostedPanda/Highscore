var express = require('express');
var router = express.Router();

// GET /admin/games
router.get('/games', async (req, res) => {

    const db = req.app.locals.db;

    const games = await getGames(db);

    res.render('admin/games/index', {
        title: 'Spel',
        layout: 'admin/shared/layout',
        games

    });
});

// GET /admin/games/new
router.get('/games/new', async (req, res) => {

    const db = req.app.locals.db;

    const genre = await getGenre(db);

    res.render('admin/games/new', {
        title: 'Nytt spel',
        layout: 'admin/shared/layout',
        genre
    });
});


// GET /admin/score/new
router.get('/score/new', async (req, res) => {

    const db = req.app.locals.db;

    const sql = `
    SELECT
    game.id,
    title
    FROM game
    `

    const result = await db.query(sql)

    res.render('admin/score/new', {
        title: 'New highscore',
        layout: 'admin/shared/layout',
        games: result.rows

    });
});


// POST /admin/score/new
router.post('/score/new', async (req, res) => {

    const {
        game_id,
        player,
        created_at,
        points
    } = req.body;


    const score = {
        game_id,
        player,
        created_at,
        points: parseFloat(points)
    };

    const db = req.app.locals.db;

    await saveScore(score, db);

    res.redirect('/admin/games')
});

// POST /admin/games/new
router.post('/games/new', async (req, res) => {

    const {
        title,
        description,
        image_url,
        release_date,
        genre_id,
    } = req.body;


    const game = {
        title,
        description,
        image_url,
        release_date,
        url_slug: generateURLSlug(title),
        genre_id,
    };

    const db = req.app.locals.db;

    await saveGame(game, db);

    res.redirect('/admin/games')
});

const generateURLSlug = (name) =>
    name.replace('-', '')
        .replace(' ', '-')
        .replace(' ', '-')
        .replace(' ', '-')
        .toLowerCase();


async function saveScore(score, db) {

    const sql = `
    INSERT INTO score (
        game_id,
        player,
        created_at,
        points
    ) VALUES ($1, $2, $3, $4)
    `;

    await db.query(sql, [
        score.game_id,
        score.player,
        score.created_at,
        score.points
    ]);

}

async function getGames(db) {

    const sql = `
    SELECT
        game.id,
        title,
        COALESCE(genre, 'N/A') as genre,
        to_char(release_date,'yyyy') as release_date
    FROM game
    LEFT JOIN game_genre
        ON game_genre.game_id = game.id
    LEFT JOIN genre
        ON genre.id = game_genre.genre_id
        order by game.id asc
    `;

    const result = await db.query(sql);

    return result.rows;
}

async function getGenre(db) {

    const sql = `
    SELECT *
    FROM genre
    `;

    const result = await db.query(sql);

    return result.rows;
}

async function saveGame(game, db) {

    const sql = `
    WITH first_insert as (
        INSERT INTO game (
            title,
            description,
            image_url,
            release_date,
            url_slug
        ) VALUES ($1, $2, $3, $4, $5)
	RETURNING id
)
    INSERT INTO game_genre (
        game_id,
        genre_id
    ) VALUES
    (
        (select id from first_insert),
        $6
    );
    `;

    await db.query(sql, [
        game.title,
        game.description,
        game.image_url,
        game.release_date,
        game.url_slug,
        game.genre_id
    ]);

}

module.exports = router;