var socket = io('/exampleTask');
socket.emit('join', 'status');

var statuses = new Map();
statuses.set('start', 'online');
statuses.set('restart', 'restarting');
statuses.set('stop', 'offline');

Map.prototype['getKey'] = function (index) {
    let keys = this.keys();
    for (var i = 0; i < index; i++) {
        keys.next();
    }
    return keys.next().value;
};

Map.prototype['getValue'] = function (index) {
    let values = this.values();
    for (var i = 0; i < index; i++) {
        values.next();
    }
    return values.next().value;
};

for (var i = 0; i < statuses.size; i++) {
    socket.on(statuses.getKey(i), function (data) {
        let value = statuses.getValue(this);
        let badge = document.querySelector('.task-status');
        badge.className = badge.className.replace(/status-[^ ]+/, `status-${value}`);
        badge.innerText = value.toUpperCase();
    }.bind(i));
}

for (var i = 0; i < statuses.size; i++) {
    document.querySelector(`.button-${statuses.getKey(i)}`).addEventListener('click', function() {
        let status = statuses.getKey(this);
        socket.emit(status);
    }.bind(i));
}