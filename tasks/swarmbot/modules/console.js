const Module = require('../../../class/module.js');

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
        app.post(`/${task.namespace}/${this.roomName}`, function (req, res) {
            this.console.push(req.body);

            while (this.console.length > 200) {
                this.console.shift();
            }

            this.io.of(`/${task.namespace}`).in(this.roomName).emit('log', [req.body]);
            req.sendStatus(200);
        }.bind(this));
    }
}

module.exports = Console;