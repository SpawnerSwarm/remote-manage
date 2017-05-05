var socket = io('/swarmbot');
socket.emit('join', 'console');
socket.on('console', function (data) {
    removeChildren(0);
    parseConsoleJSON(data);
});
socket.on('log', function (data) {
    parseConsoleJSON(data);
});
function parseConsoleJSON(json) {
    if (json === null) {
        throw new Error('Unable to parse console JSON');
    } else {
        let con = document.querySelector('.console');
        for (var i = 0; i < json.length; i++) {
            let span = document.createElement('span');
            span.className = `console-line console-${json[i].level.toLowerCase()}`;
            span.innerText = ` ${json[i].message}`;
            let levelSpan = document.createElement('span');
            levelSpan.className = `console-line-level console-${json[i].level.toLowerCase()}-level`;
            levelSpan.innerText = json[i].level.substring(0, 3);
            span.prepend(levelSpan);
            con.appendChild(span);
        }
        if (con.childElementCount > 200) {
            removeChildren(50);
        }
    }
}
function removeChildren(len) {
    let con = document.querySelector('.console');
    let num = con.childElementCount;

    for (var i = 0; i < num - len; i++) {
        con.removeChild(con.children[0]);
    }
}