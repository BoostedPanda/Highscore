var express = require('express');
var router = express.Router();


router.get('/:urlSlug', async function(req, res, next) {

    const urlSlug = req.params.urlSlug;

    const db = req.app.locals.db;

    const sql = `
    SELECT
    title,
    description,
    image_url,
    to_char(release_date,'yyyy') as release_date,
    COALESCE(genre, 'N/A') as genre,
    player,
    to_char(created_at,'yyyy-mm-dd') as created_at,
    points
    FROM game
     LEFT JOIN game_genre
     ON game_genre.game_id = game.id
      LEFT JOIN genre
      ON genre.id = game_genre.genre_id
     LEFT JOIN score
     ON score.game_id = game.id
     WHERE url_slug = $1
     ORDER BY points desc fetch first 10 rows only
    `;

    const result = await db.query(sql, [urlSlug]);

    const gameDetail = result.rows[0];


  res.render('games/details', {
    title: gameDetail.title,
    games: result.rows,
    gameDetail

  });
});

module.exports = router;