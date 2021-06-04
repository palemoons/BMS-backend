var express = require('express');
var pool = require('../db/dbConnect');
var router = express.Router();
var jwt = require('jsonwebtoken');

/* get the POST from login page */
router.post('/', function (req, res, next) {
  pool.query(`SELECT admin_id FROM administrator WHERE admin_name='${req.body.user}' AND password='${req.body.pwd}'`, (err, rows) => {
    if (err) throw err;
    else if (rows.length === 0) {
      res.status(401).send('Invalid username or password.');
      return;
    }
    else {
      let jwtString = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + (60 * 60),
          'sub': 'login',
          'iss': req.body.user,
        },
        'secret');
      res.status(200)
        .cookie('token', jwtString, {
          maxAge: 1 * 3600000,
          httpOnly: true
        })
        .send();
      return;
    }
  })
});

module.exports = router;

