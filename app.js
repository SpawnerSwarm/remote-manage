const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 80;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

global.TASK_CONSOLE = [[]];
global.TASKS = ['swarmbot'];
global.NAMESPACES = [];
global.APPROVED_IPS = process.env.APPROVED_IPS;

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
    //res.sendFile(__dirname + '/index.html');
    res.render('index', {title: 'Remote Manage', tasks: ['TaskExample']});
});

app.post('/console/:task', function(req, res) {
    if(req.params.task === 'swarmbot') {
        console.log(req.ip);
        let index = 0;
        appendMessage(req.body, index);
    }
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

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


http.listen(port, function () {
    console.log(`listening on *:${port}`);
});