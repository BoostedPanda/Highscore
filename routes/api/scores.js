var express = require('express');
var router = express.Router();


/**
 * @swagger
 * /api/scores/highscores:
 *   get:
 *     description: Get all highscores
 *     tags: [Highscores]
 *     responses:
 *       200:
 *          description: Returns list of Highscores
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Highscores'
 */
router.get('/highscores', async function (req, res) {

    const db = req.app.locals.db;

    const scores = await getHighscores(db);

    res.json(scores);
});


/**
 * @swagger
 * /api/scores:
 *   post:
 *     summary: Create new Highscore
 *     description: Create new game
 *     tags: [Highscores]
 *     consumes:
 *       - application/json
 *     requestBody:
 *       description: Highscore details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/NewHighscore'
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: Returns game
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/Highscore'
 *       400:
 *         description: Invalid highscore
 */
router.post('/', async (req, res) => {

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

    score.id = await saveScore(score, db);


    res.status(201).send(score);
});

async function getHighscores(db) {

    const sql = `
        SELECT title,
        points
        FROM score
        left JOIN game
        ON game.id = score.game_id
        `;

    const result = await db.query(sql);

    return result.rows;
}

async function saveScore(score, db) {

    const sql = `
        INSERT INTO score (
            game_id,
            player,
            created_at,
            points
        ) VALUES ($1, $2, $3, $4)
        RETURNING id
        `;

    const result = await db.query(sql, [
        score.game_id,
        score.player,
        score.created_at,
        score.points
    ]);
    return result.rows[0].id
}

module.exports = router;


/**
 * @swagger
 * components:
 *   schemas:
 *     Highscores:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Game title
 *         points:
 *           type: integer
 *           description: Game Highscore
 *     NewHighscore:
 *       type: object
 *       properties:
 *         game_id:
 *           type: integer
 *           description: Game id
 *         player:
 *           type: string
 *           description: Highscore player
 *         created_at:
 *           type: date
 *           description: Highscore created at
 *         points:
 *           type: integer
 *           description: Highscore points
 *     Highscore:
 *       type: object
 *       properties:
 *         game_id:
 *           type: integer
 *           description: Game id
 *         player:
 *           type: string
 *           description: Highscore player
 *         image_url:
 *           type: string
 *           description: Game image
 *         created_at:
 *           type: date
 *           description: Highscore created at
 *         points:
 *           type: integer
 *           description: Highscore points
 *         id:
 *           type: integer
 *           description: Highscore id
 */