var express = require('express');
var pool = require('../db/dbConnect');
const { response } = require('../app');
var router = express.Router();

/* GET users listing. */
router.post('/', function (req, res, next) {
  pool.query('SELECT * FROM administrator', (err, rows, fields) => {
    if (err) throw err;
    console.log(rows[0].admin_id);
  })
});

module.exports = router;
