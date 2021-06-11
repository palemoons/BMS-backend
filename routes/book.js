var express = require('express');
var { v4: uuidv4 } = require('uuid')
var pool = require('../db/dbConnect');
var router = express.Router();

//默认数据格式满足要求
router.put('/single-import', (req, res) => {
    //检查是否重名
    pool.query(`SELECT * FROM book WHERE book_title='${req.body.book_title}'`, ((err, result) => {
        if (err) throw err;
        else if (result.length > 0) {
            res.status(403).send('Book already exists.');
        }
        else {
            let book_id = uuidv4();
            pool.query(`INSERT INTO book VALUES('${book_id}','${req.body.category}','${req.body.book_title}','${req.body.press}',${req.body.pub_date},'${req.body.author}',${req.body.price},${req.body.total},${req.body.stock});`, (err) => {
                if (err) throw err;
            });
            res.status(201).send('Created');
        }
    }))
})

module.exports = router;