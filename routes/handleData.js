var express = require('express');
var qs = require('querystring');
var url = require('url');
var router = express.Router();

router.post('/:task', function (req, res, next) {
    if (req.body == {} || !global.TASKS.includes(req.params.task)) {
        res.sendStatus(400);
    } else {
        console.log(req.ip);
        if (req.ip != '::ffff:127.0.0.1') {
            res.sendStatus(403);
        } else {
            let line = req.body;
            let index = global.TASKS.indexOf(req.params.task);
            console.log(req.body)

            //global.TASK_CONSOLE[index].push(req.body);
            appendMessage(req.body, index)
            res.sendStatus(200);
            /*if (global.TASK_CONSOLE[index].length > 200 && !global.IS_SHORTENING[index]) {
                global.IS_SHORTENING[index] = true;
                let arr = [];
                for (var i = 20; i < 70; i++) {
                    arr.push(global.TASK_CONSOLE[i]);
                }
                global.TASK_CONSOLE[index] = arr;
                global.IS_SHORTENING[index] = false;
            }*/
            //process.emit(`console_updated_${req.params.task}`);
        }
    }
});

router.get('/:task', function (req, res, next) {
    if (!global.TASKS.includes(req.params.task)) {
        res.sendStatus(400);
    } else {
        if (req.param('first') == "false") {
            /*process.addListener(`console_updated_${req.params.task}`, () => {
                res.send(global.TASK_CONSOLE[global.TASKS.indexOf(req.params.task)]);
                process.removeAllListeners();
            });*/
            let u = url.parse(req.url);
            let q = qs.parse(u.query);
            let since = parseInt(q.since, 10);
            query(since, (data) => {
                res.send(data);
            }, req.params.task, res);
        } else {
            res.send(global.TASK_CONSOLE[global.TASKS.indexOf(req.params.task)]);
        }
        //res.send(`${global.TASK_CONSOLE[0].length}`);
    }
});

function appendMessage(json, task) {
    json.timestamp = new Date().getTime();
    global.TASK_CONSOLE[task].push(json);

    while (global.CALLBACKS[task].length > 0) {
        global.CALLBACKS[task].shift().callback([json])
    }

    while (global.TASK_CONSOLE[task].length > 200) {
        global.TASK_CONSOLE[task].shift();
    }
}

function query(since, callback, task, res) {
    let matching = [];
    let items = global.TASK_CONSOLE[global.TASKS.indexOf(task)];

    for (var i = 0; i < items.length; i++) {
        if (items[i].timestamp > since) {
            matching.push(items[i]);
        }
    }

    if (matching.length != 0) {
        callback(matching);
    } else {
        global.CALLBACKS[global.TASKS.indexOf(task)].push({ timestamp: new Date().getTime(), callback: callback });
    }
}

module.exports = router;