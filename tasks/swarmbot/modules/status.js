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
                this.emit(status);
            }.bind(socket, status));
        });
    }
}

module.exports = Status;