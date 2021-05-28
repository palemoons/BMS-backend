let mysql = require('mysql');
let mysqlInfo = require('./config.json');

let pool = mysql.createPool(mysqlInfo.mysqlInfo);

exports.getConnection = function (callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            return callback(err);
        }
        callback(err, conn);
    });
};

module.exports = pool;