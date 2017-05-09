const Task = require('../../class/task.js');

const Console = require('./modules/console.js');
const Status = require('./modules/status.js');

class ExampleTask extends Task {
    constructor() {
        super('Example Task', 'exampleTask');
        this.bindServiceModule(Status);
        this.bindServiceModule(Console);
        this.defaultToFirst = true;
    }
}

module.exports = ExampleTask;