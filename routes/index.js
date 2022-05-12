var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {

  const db = req.app.locals.db;

  const sql = `
  SELECT DISTINCT ON (title)
    title,
    game.id as game_gid,
    url_slug,
    COALESCE (points, 0) as points,
    COALESCE (player, 'N/A') as player,
    COALESCE (TO_CHAR(created_at,'yyyy-mm-dd'), 'N/A') as created_at
  FROM game
  FULL JOIN score
  ON score.game_id = game.id
  ORDER BY title ASC
  `

  const result = await db.query(sql)

  res.render('index', {
     title: 'Highscore',
     games: result.rows
    });
});

module.exports = router;

// select distinct on (game_id)
// player,
// points,
// title,
// url_slug,
// to_char(created_at,'yyyy-mm-dd') as created_at
// from score
// INNER JOIN game
// ON game.id = score.game_id
// order by game_id, points desc