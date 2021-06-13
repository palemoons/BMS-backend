var express = require('express');
var pool = require('../db/dbConnect');
var router = express.Router();

router.post('/', (req, res) => {
    if (req.body.field === 'price') {
        if (req.body.minPrice === '') {
            pool.query(`SELECT * FROM book WHERE ${req.body.field} < '${req.body.maxPrice}' ORDER BY ${req.body.query};`, (err, rows) => {
                if (err) throw err;
                res.status(200).send(JSON.stringify(rows));
            })
        }
        else if (req.body.maxPrice === '') {
            pool.query(`SELECT * FROM book WHERE ${req.body.field} > '${req.body.minPrice}' ORDER BY ${req.body.query};`, (err, rows) => {
                if (err) throw err;
                res.status(200).send(JSON.stringify(rows));
            })
        }
        else {
            pool.query(`SELECT * FROM book WHERE ${req.body.field} < '${req.body.maxPrice}' && ${req.body.field} > '${req.body.minPrice}' ORDER BY ${req.body.query};`, (err, rows) => {
                if (err) throw err;
                res.status(200).send(JSON.stringify(rows));
            })
        }
    }
    else {
        pool.query(`SELECT * FROM book WHERE ${req.body.field} like '%${req.body.condition}%' ORDER BY ${req.body.query};`, (err, rows) => {
            if (err) throw err;
            res.status(200).send(JSON.stringify(rows));
        })
    }
})

module.exports = router;