var express = require('express');
var router = express.Router();

/**
 * @swagger
 * /api/games:
 *   get:
 *     description: Get all games
 *     tags: [Games]
 *     parameters:
 *       - name: title
 *         in: query
 *         description: Game title
 *         required: false
 *     responses:
 *       200:
 *          description: Returns list of Game
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Games'
 */
router.get('/', async function (req, res) {

  const {
    title
  } = req.query;

  const db = req.app.locals.db;

  const games = title ?
    await searchGames(title, db) :
    await getGames(db);

  res.json(games);
});


/**
 * @swagger
 * /api/games/{urlSlug}:
 *   get:
 *     description: Get game
 *     tags: [Games]
 *     parameters:
 *       - name: urlSlug
 *         in: path
 *         description: Game urlSlug
 *         required: true
 *     responses:
 *       200:
 *         description: Returns game
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/Games'
 *       404:
 *         description: Game not found
 */
router.get('/:urlSlug', async function (req, res) {

  const {
    urlSlug
  } = req.params

  const db = req.app.locals.db;

  const game = await getGame(urlSlug, db);

  if (!game) {
    res.status(404).send()
    return
  }

  res.json(game);
});


/**
 * @swagger
 * /api/games:
 *   post:
 *     summary: Create new game
 *     description: Create new game
 *     tags: [Games]
 *     consumes:
 *       - application/json
 *     requestBody:
 *       description: Game details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/NewGame'
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: Returns game
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/Games'
 *       400:
 *         description: Invalid game
 */
router.post('/', async (req, res) => {

  const db = req.app.locals.db;

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

  game.id = await saveGame(game, db)

  res.location(`/api/games/${game.url_slug}`)

  res.status(201).send(game);
})


/**
 * @swagger
 * /api/games/{urlSlug}:
 *   delete:
 *     description: Delete game
 *     tags: [Games]
 *     parameters:
 *       - name: urlSlug
 *         in: path
 *         description: Game urlSlug
 *         required: true
 *     responses:
 *       204:
 *         description: Game deleted
 */
router.delete('/:urlSlug', async (req, res) => {

  const db = req.app.locals.db

  const {
    urlSlug
  } = req.params


  await deleteProduct(urlSlug, db);


  res.status(204).send()
})


/**
 * @swagger
 * /api/games/{urlSlug}/highscores:
 *   get:
 *     description: Get game highscore
 *     tags: [Games]
 *     parameters:
 *       - name: urlSlug
 *         in: path
 *         description: Game urlSlug
 *         required: true
 *     responses:
 *       200:
 *         description: Returns game highscore
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/GameHighscore'
 */
router.get('/:urlSlug/highscores', async function (req, res) {

  const {
    urlSlug
  } = req.params

  const db = req.app.locals.db;

  const score = await getHighscore(urlSlug, db);

  res.json(score);
});

const generateURLSlug = (name) =>
  name.replace('-', '')
  .replace(' ', '-')
  .replace(' ', '-')
  .replace(' ', '-')
  .toLowerCase();

async function getGames(db) {

  const sql = `
            SELECT title,
                description,
                image_url,
                release_date,
                genre
              FROM game
              INNER JOIN game_genre
              ON game_id = game.id
              INNER JOIN genre
              ON genre.id = genre_id
        `;

  const result = await db.query(sql);

  return result.rows;
}

async function searchGames(title, db) {

  const sql = `
        SELECT title,
        description,
        image_url,
        release_date,
        genre
      FROM game
      INNER JOIN game_genre
      ON game_id = game.id
      INNER JOIN genre
      ON genre.id = genre_id
         WHERE title ILIKE '%' || $1 || '%'
        `;

  const result = await db.query(sql, [title]);

  return result.rows;
}

async function getGame(urlSlug, db) {

  const sql = `
                SELECT title,
                description,
                image_url,
                release_date,
                genre
            FROM game
            INNER JOIN game_genre
            ON game_id = game.id
            INNER JOIN genre
            ON genre.id = genre_id
              WHERE url_slug = $1
        `;

  const result = await db.query(sql, [urlSlug]);

  const game = result.rows.length > 0 ?
    result.rows[0] :
    null;

  return game;
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

async function deleteProduct(urlSlug, db) {

  const sql = `
        DELETE FROM game
        WHERE url_slug = $1
      `;

  await db.query(sql, [urlSlug])

}

async function getHighscore(urlSlug, db) {

  const sql = `
      SELECT title,
      points,
      player,
      created_at
      FROM game
      INNER JOIN score
      ON score.game_id = game.id
      WHERE url_slug = $1
      `;

  const result = await db.query(sql, [urlSlug]);

  return result.rows;
}


module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Games:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Game title
 *         description:
 *           type: string
 *           description: Game description
 *         image_url:
 *           type: string
 *           description: Game image
 *         release_date:
 *           type: date
 *           description: Game release date
 *         genre:
 *           type: string
 *           description: Game genre
 *     NewGame:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Game title
 *         description:
 *           type: string
 *           description: Game description
 *         image_url:
 *           type: string
 *           description: Game image
 *         release_date:
 *           type: date
 *           description: Game release date
 *         genre_id:
 *           type: integer
 *           description: Game genre id
 *     GameHighscore:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Game title
 *         points:
 *           type: integer
 *           description: Game highscore
 *         player:
 *           type: string
 *           description: Player
 *         created_at:
 *           type: date
 *           description: Highscore created at
 */