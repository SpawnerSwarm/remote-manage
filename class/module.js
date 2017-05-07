'use strict';

const path = require('path');

class Module {
    constructor(displayName, roomName) {
        this.displayName = displayName;

        this.roomName = roomName;
    }

    init(io, app, task) {
        this.task = task;
        app.get(`/${task.namespace}/${this.roomName}`, function(req, res) {
            res.render(path.join(__dirname.replace('class', 'tasks'), this.task.namespace, `views/${this.roomName}.jade`), {tasks: global.tasks, task: this.task, module: this});
        }.bind(this));
        if(this.onInit) {
            this.onInit(io, app, task);
        }
    }
}

module.exports = Module;