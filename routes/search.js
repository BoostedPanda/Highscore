var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {

    const searchTerm = req.query.q;

  const db = req.app.locals.db;

  const sql = `
  SELECT
    title,
    genre,
    url_slug,
    to_char(release_date,'yyyy') as release_date,
    image_url
  FROM game
  LEFT JOIN game_genre
    ON game_genre.game_id = game.id
    LEFT JOIN genre
    ON genre.id = game_genre.genre_id
  WHERE title ILIKE '%' || $1 || '%'
  `

  const result = await db.query(sql, [searchTerm])

  res.render('search', {
     title: 'Sökresultat',
     games: result.rows
    });
});

module.exports = router;
