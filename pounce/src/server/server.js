var express = require('express'); // Express contains some boilerplate to for routing and such
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http, {
  pingTimeout: 60000,
});
var shuffle = require('shuffle-array');
var cards = require('../shared/js/cards');


const DEBUG = true;


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const create_new_room = function() {
    let room_data = {
        sockets: []
    };
    room_data.num_players = function() { return room_data.sockets.length; };
    return room_data;
};

const room_data = {};
if (DEBUG) {
    room_data['testroom'] = create_new_room();
}

app.use('/js/shared', express.static(path.resolve(__dirname + '/../shared/js')));
app.use('/js/client', express.static(path.resolve(__dirname + '/../client/js')));
app.use('/css', express.static(path.resolve(__dirname + '/../client/css')));
app.use('/assets', express.static(path.resolve(__dirname + '/../resources')));

app.get("/favicon.ico", function (request, response) {
    let suit_idx = Math.floor(Math.random() * 4);
    if (suit_idx === 0) {
        response.sendFile(path.resolve(__dirname + '/../resources/imgs/club.ico'));
    } else if (suit_idx === 1) {
        response.sendFile(path.resolve(__dirname + '/../resources/imgs/diamond.ico'));
    } else if (suit_idx === 2) {
        response.sendFile(path.resolve(__dirname + '/../resources/imgs/heart.ico'));
    } else {
        response.sendFile(path.resolve(__dirname + '/../resources/imgs/spade.ico'));
    }
});

// Serve the index page 
app.get("/", function (request, response) {
  response.sendFile(path.resolve(__dirname + '/../client/html/index.html'));
});

app.get("/room/:room_id", function(request, response) {
    const room_id = request.params.room_id;
    console.log('User trying to enter room', room_id);
    if (room_data.hasOwnProperty(room_id)) {
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

const get_new_room_id = function(id_len = 5) {
    return Math.random().toString(36).substring(2, 2 + id_len);
};

const update_player_names = function(room_id) {
    let all_player_names = [];
    for (let i = 0; i < room_data[room_id].num_players(); i++) {
        const s = room_data[room_id].sockets[i];
        all_player_names.push(s.hasOwnProperty('player_name') ? s.player_name : null);
    }
    io.emit('update_players', all_player_names);
};

const start_hand = function (room_id) {
    let room = room_data[room_id];

    let decks = [];
    for (let i = 0; i < room.num_players(); i++) {
        decks.push(new cards.Deck());
        shuffle(decks[i].cards);
    }

    room.center_piles = [];
    for (let i = 0; i < 4; i++) {
        room.center_piles.push([]);
        for (let j = 0; j < room.num_players(); j++) {
            room.center_piles[i].push(0);
        }
    }

    for (let i = 0; i < room.num_players(); i++) {
        room.sockets[i].emit('start_hand', { deck: decks[i], num_players: room.num_players() });
    }
};

const start_game = function(room_id) {
    start_hand(room_id);
};

const handle_pounce = function(room_id, pouncer_socket) {
    for (let i = 0; i < room_data[room_id].num_players(); i++) {
        room_data[room_id].sockets[i].emit('hand_done', pouncer_socket.player_name);
    }
};

const handle_request_for_center = function(room_id, requesting_socket, center_data) {
    // TODO: race-conditions
    let room = room_data[room_id];
    let suit_idx = center_data.center_pile_coords[0];
    let player_idx = center_data.center_pile_coords[1];
    let old_val = center_data.center_card_old_val;

    if (room.center_piles[suit_idx][player_idx] === old_val) {
        room.center_piles[suit_idx][player_idx]++;

        requesting_socket.emit('accept_request_move_to_center');

        for (let i = 0; i < room.num_players(); i++) {
            room.sockets[i].emit('update_center', {
                center_pile_coords: center_data.center_pile_coords,
                new_val: old_val + 1
            });
        }

        // TODO: Scoring
    } else {
        requesting_socket.emit('reject_request_move_to_center');
    }

};

// Tell Socket.io to start accepting connections
io.on('connection', function(socket){
    console.log("New client has connected with id:",socket.id);

    // Listen for a new room request
    socket.on('create_new_room', function(){
        console.log('New Room Request from client with id:', socket.id);
        const room_id = get_new_room_id();
        room_data[room_id] = create_new_room();

        console.log('New room created with id:', room_id);
        socket.emit('new_room_created', room_id);
    });

    // Listen for request to join a room
    socket.on('request_room_join', function (room_id) {
        if (room_data.hasOwnProperty(room_id)) {
            socket.room_id = room_id;
            room_data[room_id].sockets.push(socket);
            console.log('socket', socket.id, 'joined room', room_id);

            // TODO: remove sleep
            sleep(500).then(() => {
                socket.emit('confirm_room_join', room_id);

                update_player_names(room_id);
            });
        }
    });

    // Listen for setting name
    socket.on('set_name', function (name) {
        console.log('socket', socket.id, 'is requesting name', name);

        // TODO: race-conditions
        for (let i = 0; i < room_data[socket.room_id].num_players(); i++) {
            const s = room_data[socket.room_id].sockets[i];
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

    socket.on('start_game', function () {
        console.log('socket', socket.id, 'is requesting to start the game in room', socket.room_id);
        start_game(socket.room_id);
    });

    socket.on('pounce', function() {
        console.log('socket', socket.id, 'has pounced in room', socket.room_id);
        handle_pounce(socket.room_id, socket);
    });

    socket.on('request_move_to_center', function(data) {
        console.log('socket', socket.id, 'is trying to move to the center with data', data);
        handle_request_for_center(socket.room_id, socket, data);
    });

    socket.on('disconnect', function(){
        if (socket.hasOwnProperty('room_id')) {
            for (let i = 0; i < room_data[socket.room_id].num_players(); i++) {
                if (socket.id === room_data[socket.room_id].sockets[i].id) {
                    // remove this socket
                    room_data[socket.room_id].sockets.splice(i, 1);
                    break;
                }
            }
            update_player_names(socket.room_id);
        }
    });
});

