const Task = require('../../class/task.js');

const Console = require('./modules/console.js');

class SwarmBot extends Task {
    constructor() {
        super('SwarmBot', 'swarmbot');
        this.bindServiceModule(Console);
    }
}

module.exports = SwarmBot;