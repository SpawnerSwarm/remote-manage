const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 3000;
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

global.TASK_CONSOLE = [[]];
global.TASKS = ['swarmbot'];
global.NAMESPACES = [];
global.APPROVED_IPS = ['::1'];

for(var i = 0; i < global.TASKS.length; i++) {
    global.NAMESPACES.push(io.of(`/${global.TASKS[i]}`));
}

for(var i = 0; i < global.NAMESPACES.length; i++) {
    let nsp = global.NAMESPACES[i];
    nsp.on('connection', function(socket) {
        if(global.APPROVED_IPS.includes(socket.handshake.address)) {
            console.log(`User connected to ${nsp.name} from ${socket.handshake.address}`);
            socket.on('join', function(data) {
                console.log(`User requested to join room ${data}`);
                socket.join(data);
                socket.emit('console', global.TASK_CONSOLE[0]);
            });
        } else {
            console.log(`Connection refused to namespace ${nsp.name}. Reason: ${socket.handshake.address} is not an approved IP address for this namespace`);
            socket.disconnect();
        }
    });
}

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.post('/console/:task', function(req, res) {
    if(req.params.task === 'swarmbot') {
        console.log(req.ip);
        let index = 0;
        appendMessage(req.body, index);
    }
    console.log(req.body.message);
    res.sendStatus(200);
});

app.get('/console/:task', function(req, res) {
    if(req.params.task === 'swarmbot') {
        res.send(global.TASK_CONSOLE[global.TASKS.indexOf(req.params.task)]);
    }
    else {
        res.sendStatus(400);
    }
});

function appendMessage(json, task) {
    global.TASK_CONSOLE[task].push(json);

    while (global.TASK_CONSOLE[task].length > 200) {
        global.TASK_CONSOLE[task].shift();
    }

    io.of('/swarmbot').in('console').emit('log', [json]);
}

app.get('/swarmbot/console', function(req, res) {
    res.send(global.TASK_CONSOLE[0]);
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});