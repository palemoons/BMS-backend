var express = require('express');
var { v4: uuidv4 } = require('uuid');
var multer = require('multer');
var upload = multer();
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
            pool.query(`INSERT INTO book VALUES('${book_id}','${req.body.category}','${req.body.book_title}','${req.body.press}',${req.body.pub_date},'${req.body.author}',${req.body.price},${req.body.total},${req.body.total});`, (err) => {
                if (err) throw err;
            });
            res.status(201).send('Created');
        }
    }))
})

router.put('/file-import', upload.single('file'), (req, res) => {
    let exists = false;
    let buf = req.file.buffer.toString();
    let data = buf.split('\r\n').map((block) => {
        return block.split(',');
    });
    //检查是否重名
    let checkPromise = new Promise((resolve) => {
        let count = 0;
        data.forEach((value, i, array) => {
            let promise = new Promise((resolve) => {
                pool.query(`SELECT * FROM book WHERE book_title='${value[1]}'`, (err, rows) => {
                    if (err) throw err;
                    else if (rows.length > 0) exists = true;
                    resolve();
                })
            })
            promise.then(() => {
                count++;
                if (count === array.length) resolve();
            })
        })
    })
    checkPromise.then(() => {
        if (exists) res.status(403).send('Book already exists.');
        else {
            let insertPromise = new Promise((resolve) => {
                let count = 0;
                data.forEach((value) => {
                    let promise = new Promise((resolve) => {
                        let book_id = uuidv4();
                        pool.query(`INSERT INTO book VALUES('${book_id}','${value[0]}','${value[1]}','${value[2]}',${value[3]},'${value[4]}',${value[5]},${value[6]},${value[6]});`, (err) => {
                            if (err) throw err;
                            resolve();
                        });
                    })
                    promise.then(() => {
                        count++;
                        if (count === data.length) resolve();
                    })
                })
            })
            insertPromise.then(() => { res.status(201).send('Created'); })
        }
    })
})

module.exports = router;