var express = require('express');
var router = express.Router();

router.get('/tasks/:taskName/page/:pageName', function(req, res, next) {
    res.render('index', { params: req.params });
});

/* GET home page. */
router.get('/', function(req, res, next) {
    process.emit('message');
    res.render('index', { title: 'Express' });
});

module.exports = router;
