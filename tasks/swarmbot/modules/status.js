const Module = require('../../../class/module.js');

class Status extends Module {
    constructor() {
        super('Status', 'status');
    }

    onJoin(socket, userData) {
        socket.emit('start');
        let statuses = [
            'start',
            'restart',
            'stop'
        ];
        statuses.forEach((status) => {
            socket.on(status, function (status) {
                this.io.of(`/${this.task.namespace}`).in(this.roomName).emit(status);
            }.bind(this, status));
        });
    }

    onInit(io, app, task) {
        this.io = io;
        this.task = task;
    }
}

module.exports = Status;