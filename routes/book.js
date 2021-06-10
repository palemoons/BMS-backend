var express = require('express');
var pool = require('../db/dbConnect');
var router = express.Router();

//book infomation to be inserted is regarded as true
router.post('/single-import', (req, res) => {
    console.log(req.body);
    pool.query(`INSERT INTO book VALUES('${req.body.book_id}','${req.body.category}','${req.body.book_title}','${req.body.press}',${req.body.pub_date},'${req.body.author}',${req.body.price},${req.body.total},${req.body.stock})`, (err) => {
        if (err) throw err;
    });
})

module.exports = router;