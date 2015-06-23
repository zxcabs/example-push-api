/**
 * @author "Evgeny Reznichenko" <kusakyky@gmail.com>
 */
var
    express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    request = require('superagent'),
    consts = require('../consts'),
    history = [],
    subscribes = {};

app.use(express.static('./static'));

function sendToSubscribe(subscribe) {
    request
        .post('https://gcm-http.googleapis.com/gcm/send')
        .set('Authorization', 'key=AIzaSyAbD6YlXIF4CGkVEmt2hyLbye7IXM9Rcwc')
        .set('Content-Type', 'application/json')
        .send({
            to: subscribe.subscriptionId
        })
        .end(function (err, res) {
            if (err) return console.error(err);
            console.log(res.body);
        });
}

function emitSubscribers(userId, message) {
    Object.keys(subscribes)
        .filter(function (id) {
            return id !== userId;
        })
        .map(function (id) {
            return subscribes[id];
        })
        .forEach(sendToSubscribe);
}

function sendMessage(userId, type, text) {
    var
        message = {
            time: Date.now(),
            author: userId,
            type: type,
            text: text
        };

    history.push(message);
    emitSubscribers(userId, message);
    io.emit(consts.CHANNEL, message);
}

function processMessage(socket, msg) {
    console.log(msg);

    switch (msg.type) {
        case consts.MSG_TEXT:
            sendMessage(socket.id, consts.MSG_TEXT, msg.text);
            break;
        case consts.MSG_SUBSCRIBE:
            subscribes[socket.id] = msg.subscription;
            break;
        case consts.MSG_NOTSUBSCRIBE:
        case consts.MSG_UNSUBSCRIBE:
            delete subscribes[socket.id];
            break;
        default:
            console.log('Unknown message type: ', msg);
    }
}

app.get('/api/getMessage', function (req, res) {
    res.json(history[history.length - 1]);
});

io.on('connection', function (socket) {
    sendMessage(consts.SYSTEM_USER_ID, consts.MSG_SYSTEM, 'User: ' + socket.id + ' connected');

    socket.on('disconnect', function () {
        sendMessage(consts.SYSTEM_USER_ID, consts.MSG_SYSTEM, 'User: ' + socket.id + ' disconnect');
    });

    socket.on('message', function (msg) {
        processMessage(socket, msg);
    });
});

module.exports = server;
