const Task = require('../../class/task.js');

const Console = require('./modules/console.js');

class ExampleTask extends Task {
    constructor() {
        super('SwarmBot', 'swarmbot');
        this.bindServiceModule(Console);
    }
}

module.exports = ExampleTask;