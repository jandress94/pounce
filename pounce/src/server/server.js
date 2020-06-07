var express = require('express'); // Express contains some boilerplate to for routing and such
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http, {
  pingTimeout: 60000,
});
var shuffle = require('shuffle-array');

// var cards = require('../shared/js/cards');
// var d = new cards.Deck();
// shuffle(d.cards);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const open_rooms = [];
const room_id_to_sockets = {};

app.use('/js/shared', express.static(path.resolve(__dirname + '/../shared/js')));
app.use('/js/client', express.static(path.resolve(__dirname + '/../client/js')));
app.use('/css', express.static(path.resolve(__dirname + '/../client/css')));
app.use('/favicon.ico', express.static(path.resolve(__dirname + '/../resources/imgs/spade.ico')));

// Serve the index page 
app.get("/", function (request, response) {
  response.sendFile(path.resolve(__dirname + '/../client/html/index.html'));
});

app.get("/room/:room_id", function(request, response) {
    const room_id = request.params.room_id;
    console.log('User trying to enter room', room_id);
    if (open_rooms.includes(room_id)) {
        response.sendFile(path.resolve(__dirname + '/../client/html/index.html'));
    } else {
        response.sendFile(path.resolve(__dirname + '/../client/html/bad_room.html'));
    }
});

// Listen on port 5000
app.set('port', (process.env.PORT || 5000));
http.listen(app.get('port'), function(){
  console.log('listening on port',app.get('port'));
});

const get_new_room_id = function() {
    return Math.random().toString(36).substring(2, 7);
};

const update_player_names = function(room_id) {
    let all_player_names = [];
    for (let i = 0; i < room_id_to_sockets[room_id].length; i++) {
        const s = room_id_to_sockets[room_id][i];
        all_player_names.push(s.hasOwnProperty('player_name') ? s.player_name : null);
    }
    io.emit('update_players', all_player_names);
};

// Tell Socket.io to start accepting connections
io.on('connection', function(socket){
    console.log("New client has connected with id:",socket.id);

    // Listen for a new room request
    socket.on('create_new_room', function(){
        console.log('New Room Request from client with id:', socket.id);
        const room_id = get_new_room_id();
        open_rooms.push(room_id);
        room_id_to_sockets[room_id] = [];

        console.log('New room created with id:', room_id);
        socket.emit('new_room_created', room_id);
    });

    // Listen for request to join a room
    socket.on('request_room_join', function (room_id) {
        if (open_rooms.includes(room_id)) {
            socket.room_id = room_id;
            room_id_to_sockets[room_id].push(socket);
            console.log('socket', socket.id, 'joined room', room_id);

            // TODO: remove sleep
            sleep(2000).then(() => {
                socket.emit('confirm_room_join', room_id);

                update_player_names(room_id);
            });
        }
    });

    // Listen for setting name
    socket.on('set_name', function (name) {
        console.log('socket', socket.id, 'is requesting name', name);

        // TODO: race-conditions
        for (let i = 0; i < room_id_to_sockets[socket.room_id].length; i++) {
            const s = room_id_to_sockets[socket.room_id][i];
            if (s.hasOwnProperty('player_name') && s.player_name === name) {
                console.log('found the requested name', name, 'from socket', socket.id, 'already taken, rejecting');
                socket.emit('reject_name');
                return;
            }
        }
        console.log('accepting the requested name', name, 'for socket', socket.id);
        socket.player_name = name;
        socket.emit('accept_name', name);

        update_player_names(socket.room_id);
    });
});

