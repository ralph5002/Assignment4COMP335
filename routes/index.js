var express = require('express');
var path = require('path');
var pool = require('../db');
var router = express.Router();

// Pages (the home page "/" is served automatically from public/index.html)
router.get('/madlibs', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'public', 'madlibs.html'));
});

router.get('/car', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'public', 'car.html'));
});

// The car page calls this to get its table rows FROM THE DATABASE
router.get('/carOut', function (req, res, next) {
  pool.query({
    text: 'SELECT equipid, TRIM(maker), TRIM(model), year FROM car ORDER BY equipid',
    rowMode: 'array'
  }, function (err, result) {
    if (err) return next(err);
    res.json(result.rows.map(row => row.map(String)));
  });
});

// The madlibs form sends its words here; we send the finished story back
router.post('/madlibs', function (req, res) {
  const { adjective, drink, place, subject, verb, plural } = req.body;
  res.json({
    p1: `Bertin's semester has been ${adjective}. Every morning starts with a ${drink} before heading to ${place}.`,
    p2: `The favorite class is ${subject}, where hours go by ${verb} and learning something new.`,
    p3: `By the end of the term the plan is to have mastered all the ${plural}!`
  });
});

module.exports = router;
