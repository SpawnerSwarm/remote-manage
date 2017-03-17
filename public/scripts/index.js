/*var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
  return query_string;
}();

let bots = document.getElementsByClassName('nav-select-task');

for (var i = 0; i < bots.length; i++) {
    let bot = bots[i];
    bot.href = `?task=${bot.getAttribute('task')}`;
    bot.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState(null, 'Neural Sentry', bot.href)
        document.querySelector('.content').innerHTML = 'Hello';
    });
}

if(QueryString.task != null) {
    document.querySelector('.content').innerHTML = QueryString.task;
}*/

function queryConsole(data) {
    $.ajax({
        cache: false,
        dataType: 'json',
        type: 'GET',
        url: '/console/swarmbot',
        error: () => {
            setTimeout(queryConsole, 10 * 1000);
        },
        data: data || { first: false, since: new Date().getTime() },
        success: (json) => {
            parseConsoleJSON(json);
            //document.querySelector('.content').innerHTML = json;
            queryConsole();
        }
    });
}

function parseConsoleJSON(json) {
    if (json === null) {
        throw new Error('Unable to parse console JSON');
    } else {
        let con = document.querySelector('.content');
        for (var i = 0; i < json.length; i++) {
            let span = document.createElement('span');
            span.className = `console-line console-${json[i].level}`;
            span.innerText = `[${json[i].level}] ${json[i].message}`
            con.appendChild(span)
            //con.innerHTML += `foo`;
        }
        if(con.childElementCount > 200) {
            removeChildren(50);
        }
    }
}

queryConsole({ first: true, since: new Date().getTime() });

function refreshConsole() {
    setTimeout(() => {
        $.ajax({
            cache: false,
            dataType: 'json',
            type: 'GET',
            url: '/console/swarmbot',
            error: () => {
                setTimeout(queryConsole, 10 * 1000);
            },
            data: { first: true, since: new Date().getTime() },
            success: (json) => {
                removeChildren(0);
                parseConsoleJSON(json);
                refreshConsole();
            }
        });
    }, 20*1000)
}

function removeChildren(len) {
    let con = document.querySelector('.content');
    let num = con.childElementCount;

    for(var i = 0; i < num - len; i++) {
        con.removeChild(con.children[0]);
    }
}

refreshConsole();