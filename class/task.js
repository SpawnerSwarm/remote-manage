'use strict';

const path = require('path');

class Task {
    constructor(displayName, namespace) {
        this.modules = {
            auth: {
                module: function() {return new Promise((resolve) => {resolve();});},
                authenticateConnection: function() {return new Promise((resolve) => {resolve();});}
            },
            database: undefined,

            services: new Map()
        };

        this.displayName = displayName;

        this.namespace = namespace;
    }

    /**
     * @param {Module} module
     */
    bindAuthenticationModule(module) {
        this.modules.auth = module.init(this);
    }

    /**
     * @param {Module} module
     */
    bindDatabaseModule(module) {
        this.modules.database = module.init(this);
    }

    /**
     * @param {Module} module
     */
    bindServiceModule(module) {
        let mod = new module();
        this.modules.services.set(mod.roomName, mod);
    }

    init(io, app) {
        let map = this.modules.services.values();
        for(let i = 0; i < this.modules.services.size; i++) {
            let module = map.next().value;
            module.init(io, app, this);
        }
        io.of(this.namespace).on('connection', function (socket) {
            this.modules.auth.authenticateConnection(module.roomName, socket).then((userData) => {
                socket.on('join', (data) => {
                    if(this.modules.services.has(data)) {
                        let module = this.modules.services.get(data);
                        this.modules.auth.module(module, socket).then((userData) => {
                            console.log(`User connected to module ${module.roomName} on task ${this.namespace}`);
                            socket.join(data);
                            module.onJoin(socket, userData);
                        })
                        .catch((err) => {
                            socket.emit('error', 'You are not allowed to use this module!');
                            this.emit('error', {userData: userData, errorAt: 'module', reason: err});
                        });
                    }
                });
            }).catch((err) => {
                socket.emit('error', 'You are not allowed to access this task!');
                this.emit('error', {userData: userData, errorAt: 'namespace', reason: err});
            });
        }.bind(this));
        app.get(`/${this.namespace}`, function (req, res) {
            res.render(path.join(__dirname.replace('class', 'tasks'), this.namespace, 'views/index.jade'), {tasks: global.tasks, task: this});
        }.bind(this));
        return this;
    }
}

module.exports = Task;