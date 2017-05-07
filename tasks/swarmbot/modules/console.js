const Module = require('../../../class/module.js');

const fs = require('fs');

class Console extends Module {
    constructor() {
        super('Console', 'console');

        this.console = [];
    }

    onJoin(socket, userData) {
        socket.emit('console', this.console);
    }

    onInit(io, app, task) {
        this.io = io;
        app.post(`/${task.namespace}/${this.roomName}`, function (req) {
            this.console.push(req.body);

            while (this.console.length > 200) {
                this.console.shift();
            }

            this.io.of(`/${task.namespace}`).in(this.roomName).emit('log', [req.body]);
            req.sendStatus(200);
        }.bind(this));

        app.get(`/${task.namespace}/${this.roomName}/json`, function (req, res) {
            res.type('application/json');
            res.send(this.console);
        }.bind(this));

        app.get(`/${task.namespace}/${this.roomName}/json/download`, function (req, res) {
            let rand = Math.random();
            fs.writeFile(`tempconsole${rand}.json`, JSON.stringify(this.console), function (rand) {
                this.download(`tempconsole${rand}.json`, 'console.json', function (err) {
                    if (err) throw err;
                    fs.unlink(`tempconsole${this}.json`);
                }.bind(rand));
            }.bind(res, rand));
            
            if(res.headersSent && fs.statSync(`tempconsole${rand}.json`).isFile()) {
                fs.unlink(`tempconsole${rand}.json`);
            }
        }.bind(this));

        app.get(`/${task.namespace}/${this.roomName}/text`, function (req, res) {
            res.type('text/plain');
            let str = '';
            for (let i = 0; i < this.console.length; i++) {
                str += `<${this.console[i].level.substring(0, 3)}> ${this.console[i].message}\n`;
            }
            res.send(str);
        }.bind(this));

        app.get(`/${task.namespace}/${this.roomName}/text/download`, function (req, res) {
            let rand = Math.random();
            let stream = fs.createWriteStream(`tempconsole${rand}.txt`);
            if(this.console.length === 0) {
                res.send('No Console Data');
                return;
            }
            for (let i = 1; i <= this.console.length; i++) {
                let content = `<${this.console[i - 1].level.substring(0, 3)}> ${this.console[i - 1].message}\r\n`;
                if (i !== this.console.length) stream.write(content);
                else {
                    stream.end(content, function () {
                        res.download(`tempconsole${this}.txt`, 'console.txt', function (err) {
                            if (err) throw err;
                            fs.unlink(`tempconsole${this}.txt`);
                        }.bind(rand));
                    }.bind(rand));
                }
            }
            if(res.headersSent && fs.statSync(`tempconsole${rand}.txt`).isFile()) {
                fs.unlink(`tempconsole${rand}.txt`);
            }
        }.bind(this));
    }
}

module.exports = Console;