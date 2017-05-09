const Task = require('../../class/task.js');

const Console = require('./modules/console.js');
const Status = require('./modules/status.js');

class SwarmBot extends Task {
    constructor() {
        super('SwarmBot', 'swarmbot');
        this.bindServiceModule(Status);
        this.bindServiceModule(Console);
        this.defaultToFirst = true;
    }
}

module.exports = SwarmBot;