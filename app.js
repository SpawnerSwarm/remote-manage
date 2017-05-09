const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 80;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const fs = require('fs');

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

const taskDir = path.join(__dirname, 'tasks');
let taskDirs = fs.readdirSync(taskDir);
let taskScripts = [];
global.tasks = [];

for (let i = 0; i < taskDirs.length; i++) {
    if (fs.readdirSync(path.join(taskDir, taskDirs[i])).includes('task.js')) {
        taskScripts.push(path.join(taskDir, taskDirs[i], 'task.js'));
    }
}

for (i = 0; i < taskScripts.length; i++) {
    let task = require(taskScripts[i]);
    global.tasks.push((new task()).init(io, app));
}

app.get('/', function (req, res) {
    if (global.tasks.find(x => x.namespace === process.env.DEFAULT)) {
        res.redirect(`/${process.env.DEFAULT}`);
    } else {
        res.render('index', { tasks: global.tasks });
    }
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error', { tasks: global.tasks });
});


http.listen(port, function () {
    console.log(`listening on *:${port}`);
});