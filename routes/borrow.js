var express = require('express');
var { v4: uuidv4 } = require('uuid');
var pool = require('../db/dbConnect');
var router = express.Router();
var jwt = require('jsonwebtoken');

router.post('/check', (req, res) => {
    //检查学号是否存在
    const idCheck = new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM passport WHERE passport_id='${req.body.passport_id}';`, (err, rows) => {
            if (err) throw err;
            if (rows.length < 1) {
                res.status(403).send('Invalid passport_id');
                reject();
            }
            else {
                resolve();
            }
        })
    })
    idCheck.then(() => {
        pool.query(`SELECT book.book_id, book.category, book.book_title, book.press, book.pub_date, book.author, book.price, book.total, book.stock FROM records inner join book on records.book_id=book.book_id WHERE passport_id='${req.body.passport_id}' AND records.return_day IS NULL`, (err, rows) => {
            if (err) throw err;
            res.status(200).send(JSON.stringify(rows));
        })
    })
        .catch(() => { })
})

router.post('/borrow', (req, res) => {
    let decoded = jwt.verify(req.cookies.token, 'secret');
    const checkId = new Promise((resolve, reject) => {
        //书号是否存在
        pool.query(`SELECT * FROM book WHERE book_id='${req.body.book_id}';`, (err, rows) => {
            if (err) throw err;
            if (rows.length < 1) {
                res.status(403).send(JSON.stringify(
                    {
                        id: '01',
                        err: '图书不存在'
                    }
                ));
                reject();
            }
            else resolve();
        })
    })
    checkId.then(() => {
        const handleReq = new Promise((resolve) => {
            pool.query(`SELECT stock FROM book WHERE book_id='${req.body.book_id}';`, (err, rows) => {
                if (err) throw err;
                resolve(rows[0].stock);
            })
        })
        handleReq.then((resolve) => {
            if (resolve < 1) {
                pool.query(`SELECT * FROM records WHERE book_id='${req.body.book_id}' ORDER BY borrow_day;`, (err, rows) => {
                    if (err) throw err;
                    let return_day = new Date(rows[0].borrow_day.getTime() + 7 * 86400000);
                    res.status(403).send(JSON.stringify({
                        id: '02',
                        err: `无库存:( 最近归还时间${return_day.toISOString().slice(0, 10)}`
                    }));
                })
            }
            else {
                let borrowTime = new Date();
                // let returnTime = new Date(borrowTime.getTime() + 7 * 86400000);
                let record_id = uuidv4();
                const bookPromise = new Promise((resolve) => {
                    pool.query(`UPDATE book SET stock=stock-1 WHERE book_id='${req.body.book_id}';`, (err) => {
                        if (err) throw err;
                        resolve();
                    })
                })
                const recordPromise = new Promise((resolve) => {
                    pool.query(`INSERT records VALUES('${record_id}', '${req.body.book_id}', '${req.body.passport_id}', '${decoded.id.admin_id}', '${borrowTime.toISOString().slice(0, 10)}', null);`, (err) => {
                        if (err) throw err;
                        resolve();
                    })
                })
                Promise.all([bookPromise, recordPromise]).then(() => {
                    res.status(200).send();
                })
            }
        })
    })
        .catch(() => { })
})

router.post('/return', (req, res) => {
    const checkId = new Promise((resolve, reject) => {
        //书号是否存在
        pool.query(`SELECT * FROM book WHERE book_id='${req.body.book_id}';`, (err, rows) => {
            if (err) throw err;
            if (rows.length < 1) {
                res.status(403).send(JSON.stringify(
                    {
                        id: '01',
                        err: '图书不存在'
                    }
                ));
                reject();
            }
            else resolve();
        })
    })
    checkId.then(() => {
        let returnTime = new Date();
        const bookPromise = new Promise((resolve) => {
            pool.query(`UPDATE book SET stock=stock+1 WHERE book_id='${req.body.book_id}';`, (err) => {
                if (err) throw err;
                resolve();
            })
        })
        const recordPromise = new Promise((resolve) => {
            pool.query(`UPDATE records SET return_day='${returnTime.toISOString().slice(0, 10)}'`, (err) => {
                if (err) throw err;
                resolve();
            })
        })
        Promise.all([bookPromise, recordPromise]).then(() => {
            res.status(200).send();
        })
    })
        .catch(() => { })
})

module.exports = router;
