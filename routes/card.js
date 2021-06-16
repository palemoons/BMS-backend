var express = require('express');
var pool = require('../db/dbConnect');
var router = express.Router();

router.post('/add', (req, res) => {
    //检查学号重名
    const idCheck = new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM passport WHERE passport_id='${req.body.id}';`, (err, rows) => {
            if (err) throw err;
            if (rows.length > 0) reject();
            else resolve();
        })
    })
    idCheck.then(() => {
        pool.query(`INSERT INTO passport VALUES('${req.body.id}', '${req.body.name}', '${req.body.college}', '${(req.body.type === 'student') ? '学生' : '教职工'}');`, (err) => {
            if (err) throw err;
            res.status(201).send('Created');
        })
    })
        .catch(() => {
            res.status(403).send(JSON.stringify({
                id: '01',
                err: '用户已存在'
            }))
        })
})

router.post('/delete', (req, res) => {
    //检查学号存在
    const idCheck = new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM passport WHERE passport_id='${req.body.id}';`, (err, rows) => {
            if (err) throw err;
            if (rows.length > 0) resolve();
            else reject();
        })
    })
    idCheck.then(() => {
        //检查是否有未还书籍
        let borrowCheck = new Promise((resolve, reject) => {
            pool.query(`SELECT * FROM records WHERE passport_id='${req.body.id}' AND return_day IS NULL;`, (err, rows) => {
                if (err) throw err;
                if (rows.length > 0) reject();
                else resolve();
            })
        })
        borrowCheck.then(() => {
            pool.query(`DELETE FROM passport WHERE passport_id='${req.body.id}';`, (err) => {
                if (err) throw err;
                res.status(200).send();
            })
        })
            .catch(() => {
                res.status(403).send(JSON.stringify({
                    id: '02',
                    err: '有未归还书籍'
                }))
            })
    })
        .catch(() => {
            res.status(403).send(JSON.stringify({
                id: '01',
                err: '用户不存在'
            }))
        })
})

module.exports = router;