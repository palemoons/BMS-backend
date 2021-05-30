var express = require('express');
var pool = require('../db/dbConnect');
const { response } = require('../app');
const createHttpError = require('http-errors');
const { token } = require('morgan');
var router = express.Router();

/* get the POST from login page */
router.post('/', function (req, res, next) {
  pool.query('SELECT * FROM administrator', (err, rows) => {
    if (err) throw err;
    rows.forEach((e, i) => {
      if (e.admin_name === req.body.user) {
        if (e.password === req.body.pwd) {
          res.cookie('bms', req.body.user, {
            maxAge: 1 * 3600000,
            httpOnly: true
          });
          res.status(200).send('ok');
          return;
        }
        else {
          res.status(401).send('invalid password');
          return;
        }
      }
      if (i === rows.length - 1) res.status(401).send('invalid username');
    });
  })
});

module.exports = router;
