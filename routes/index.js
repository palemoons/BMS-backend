var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

/* GET home page. */
router.get('/check', function (req, res) {
  if(req.cookies.token){
    let decoded = jwt.verify(req.cookies.token, 'secret');
    res.status(200).send({
      'loginStatus': 'true',
      'iss': decoded.iss
    });
  }
  else {
    res.status(200).send({
      'loginStatus': 'false',
      'iss': ''
    });
  }
});

module.exports = router;
