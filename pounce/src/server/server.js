var express = require('express'); // Express contains some boilerplate to for routing and such
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http, {
  pingTimeout: 60000,
});
var shuffle = require('shuffle-array');
var cards = require('../shared/js/cards');
var constants = require('../shared/js/constants');


let STATE_JOINING = 'joining';
let STATE_PLAYING = 'playing';
let STATE_SCORES = 'scores';
let STATE_FINISHED = 'finished';

const DEBUG = true;


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const create_new_room = function() {
    let room_data = {
        players: [],
        unnamed_players: {},
        state: STATE_JOINING,

        num_players: function() { return this.players.length; },

        num_active_players: function() {
            let cnt = 0;
            for (let i = 0; i < this.num_players(); i++) {
                if (this.players[i].is_active()) {
                    cnt++;
                }
            }
            return cnt;
        }
    };

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
    response.sendFile(path.resolve(__dirname + '/../client/html/index.html'));
});

// Listen on port 5000
app.set('port', (process.env.PORT || 5000));
http.listen(app.get('port'), function(){
  console.log('listening on port',app.get('port'));
});

const get_new_room_id = function(id_len = 5) {
    return Math.random().toString(36).substring(2, 2 + id_len);
};

const get_hand_id = function() {
    return Math.random().toString(36);
};

const check_socket_consistency = function(socket, data) {
    if (!socket.hasOwnProperty('room_id') && data.hasOwnProperty('room_id')) {
        console.log('found socket inconsistency, trying to fix', data);
        // reset the socket's room_id
        socket.room_id = data.room_id;
        socket.join(data.room_id);

        let room = room_data[data.room_id];

        if (!socket.hasOwnProperty('player_name')) {
            if (data.hasOwnProperty('player_name')) {
                // the name was at one point set. Find the player with that name
                let found_player = false;

                for (let i = 0; i < room.num_players(); i++) {
                    if (room.players[i].player_name === data.player_name) {
                        socket.player_idx = i;
                        room.players[i].socket = socket;
                        found_player = true;
                        break;
                    }
                }
                if (!found_player) {
                    let player_idx = room.num_players();
                    room.players.push(create_new_player(socket, data.player_name));
                    socket.player_idx = player_idx;
                }
            } else {
                // the name was never set
                room.unnamed_players[socket.id] = socket;
            }
        }

        if (room.state === STATE_PLAYING) {
            socket.emit('refresh_all_center_piles', room.center_piles);
        }
    }
};

const send_player_name_update = function(room_id, socket = null) {
    let room = room_data[room_id];

    let all_player_names = [];
    for (let i = 0; i < room.num_players(); i++) {
        all_player_names.push(room.players[i].player_name);
    }

    for (let socket_id in room.unnamed_players) {
        if (room.unnamed_players.hasOwnProperty(socket_id)) {
            all_player_names.push(null);
        }
    }

    if (socket !== null) {
        socket.emit('update_players', all_player_names);
    } else {
        io.to(room_id).emit('update_players', all_player_names);
    }
};

const start_hand = function (room_id) {
    let room = room_data[room_id];

    if (room.state === STATE_PLAYING) {
        return;
    }

    room.state = STATE_PLAYING;
    room.hand_id = get_hand_id();

    room.num_ditches = 0;
    for (let i = 0; i < room.num_players(); i++) {
        room.players[i].num_center_cards = 0;
        room.players[i].ditch = false;
        room.players[i].num_pounce_left = constants.NUM_POUNCE_CARDS;
        room.players[i].out_this_round = false;
    }

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
        if (room.players[i].is_connected()) {
            room.players[i].socket.emit('start_hand', {deck: decks[i], num_players: room.num_players(), hand_id: room.hand_id});
        }
    }
};

const start_game = function(socket) {
    let room_id = socket.room_id;
    let room = room_data[room_id];

    if (room.state !== STATE_JOINING && room.state !== STATE_FINISHED) {
        socket.emit('start_game_rejected', "This game is already in progress. " +
            "You will need to wait until the current hand is finished " +
            "and will join as part of the next hand.");
        return;
    }

    for (let socket_id in room.unnamed_players) {
        if (room.unnamed_players.hasOwnProperty(socket_id)) {
            socket.emit('start_game_rejected', 'Not all players have set their name.');
            return;
        }
    }

    for (let i = 0; i < room.num_players(); i++) {
        room.players[i].score = 0;
    }

    start_hand(room_id);
};

const handle_ditch_update = function(room_id, socket, new_ditch_val) {
    let room = room_data[room_id];

    room.players[socket.player_idx].ditch = new_ditch_val;

    if (new_ditch_val) {
        let should_ditch = true;
        for (let i = 0; i < room.num_players(); i++) {
            if (room.players[i].is_active() && !room.players[i].ditch) {
                should_ditch = false;
                break;
            }
        }

        if (should_ditch) {
            room.num_ditches++;

            for (let i = 0; i < room.num_players(); i++) {
                room.players[i].ditch = false;
            }
            io.to(room_id).emit('ditch', {
                show_end_hand_button: room.num_ditches >= constants.NUM_DITCH_BEFORE_END_HAND,
                hand_id: room.hand_id
            });
        }
    }
};

const end_hand = function(room_id, message) {
    let room = room_data[room_id];
    room.state = STATE_SCORES;
    room.num_pounce_cards_left_recorded = 0;

    io.to(room_id).emit('hand_done', {
        message: message,
        hand_id: room.hand_id
    });
};

const handle_pounce = function(room_id, pouncer_socket) {
    end_hand(room_id, pouncer_socket.player_name + " Pounced!");
};

const refresh_socket_idxs = function(room_id) {
    let room = room_data[room_id];
    for (let i = 0; i < room.num_players(); i++) {
        room.players[i].socket.player_idx = i;
    }
};

const record_pounce_cards_left = function(socket, num_pounce_cards_left) {
    let room = room_data[socket.room_id];
    room.players[socket.player_idx].num_pounce_left = num_pounce_cards_left;
    room.num_pounce_cards_left_recorded += 1;

    if (room.num_pounce_cards_left_recorded === room.num_active_players()) {
        let score_update = {};
        let game_done = false;

        for (let i = 0; i < room.num_players(); i++) {
            let player = room.players[i];

            if (!player.hasOwnProperty('score')) {
                // just joined, set everything to zero.
                player.score = 0;
                player.num_center_cards = 0;
                player.num_pounce_left = 0;
            }

            // let name = room.players[i].player_name;
            score_update[player.player_name] = {
                start_score: player.score,
                num_center: player.num_center_cards,
                num_pounce_left: player.num_pounce_left,
                end_score: player.score + player.num_center_cards - player.num_pounce_left
            };

            player.score = score_update[player.player_name].end_score;

            if (player.score >= constants.POINTS_TO_WIN) {
                game_done = true;
            }
        }

        if (game_done) {
            room.state = STATE_FINISHED;

            let is_player_removed = false;
            for (let i = 0; i < room.num_players(); i++) {
                if (!room.players[i].is_connected()) {
                    room.players.splice(i, 1);
                    is_player_removed = true;
                }
            }

            if (is_player_removed) {
                refresh_socket_idxs(socket.room_id);
            }
        }

        io.to(socket.room_id).emit('update_scores', score_update);
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

        io.to(room_id).emit('update_center', {
            center_pile_coords: center_data.center_pile_coords,
            new_val: old_val + 1,
            hand_id: room.hand_id
        });

        room.players[requesting_socket.player_idx].num_center_cards += 1;
    } else {
        requesting_socket.emit('reject_request_move_to_center');
    }
};

const create_confirm_room_join_data = function (socket) {
    return {
        room_id: socket.room_id,
        player_name: socket.hasOwnProperty('player_name') ? socket.player_name : null,
        game_state: room_data[socket.room_id].state
    }
};

const handle_change_players = function(room_id) {
    let room = room_data[room_id];
    room.state = STATE_JOINING;

    for (let i = 0; i < room.num_players(); i++) {
        if (room.players[i].is_connected()) {
            room.players[i].socket.emit('confirm_room_join', create_confirm_room_join_data(room.players[i].socket));
        }
        send_player_name_update(room_id);
    }
};

const handle_request_room_join = function(socket, room_id) {
    if (room_data.hasOwnProperty(room_id)) {
        socket.join(room_id);
        socket.room_id = room_id;

        if (socket.hasOwnProperty('player_name')){
            delete socket.player_name;
        }

        room_data[room_id].unnamed_players[socket.id] = socket;

        console.log('socket', socket.id, 'joined room', room_id);

        socket.emit('confirm_room_join', create_confirm_room_join_data(socket));

        if (room_data[room_id].state === STATE_JOINING) {
            send_player_name_update(room_id);
        } else {
            send_player_name_update(room_id, socket);
        }
    } else {
        socket.emit('bad_room_id', room_id);
    }
};

const handle_create_new_room = function(socket) {
    console.log('New Room Request from client with id:', socket.id);
    const room_id = get_new_room_id();
    room_data[room_id] = create_new_room();

    console.log('New room created with id:', room_id);
    socket.emit('new_room_created', room_id);
};

const create_new_player = function(socket, name) {
    return {
        socket: socket,
        player_name: name,
        out_this_round: false,
        is_connected: function () {
            return this.socket !== null;
        },
        is_active: function () {
            return this.is_connected() && !this.out_this_round;
        }
    };
};

const handle_set_name = function(socket, name) {
    let room = room_data[socket.room_id];

    let already_named = socket.hasOwnProperty('player_idx');

    if (already_named && room.players[socket.player_idx].player_name === name) {
        return;
    }

    for (let i = 0; i < room.num_players(); i++) {
        const player = room.players[i];
        if (player.player_name === name) {
            if (player.is_connected()) {
                console.log('found the requested name', name, 'from socket', socket.id, 'already taken, rejecting');
                socket.emit('reject_name');
                return;
            } else {
                // reclaim the name
                socket.player_idx = i;
                player.out_this_round = true;
                player.socket = socket;
                break;
            }
        }
    }
    console.log('accepting the requested name', name, 'for socket', socket.id);
    socket.player_name = name;

    if (already_named) {
        room.players[socket.player_idx].player_name = name;
    } else {
        if (!socket.hasOwnProperty('player_idx')) {
            let player_idx = room.num_players();

            room.players.push(create_new_player(socket, name));
            socket.player_idx = player_idx;
        }

        delete room.unnamed_players[socket.id];
    }

    socket.emit('accept_name', name);

    if (room.state === STATE_JOINING) {
        send_player_name_update(socket.room_id);
    } else {
        room.players[socket.player_idx].out_this_round = true;
        send_player_name_update(socket.room_id, socket);
    }
};

const handle_end_hand = function(room_id){
    end_hand(room_id, "Hand Ended");
};

const remove_socket_from_room = function(socket) {
    let room = room_data[socket.room_id];

    if (room.state === STATE_JOINING || room.state === STATE_FINISHED) {
        room.players.splice(socket.player_idx, 1);
        refresh_socket_idxs(socket.room_id);
    } else {
        room.players[socket.player_idx].socket = null;
    }
};

const handle_leave_room = function(socket) {
    console.log('socket', socket.id, 'is disconnecting');
    if (socket.hasOwnProperty('room_id')) {
        let room_id = socket.room_id;
        let room = room_data[room_id];

        socket.leave(room_id);

        if (room.unnamed_players.hasOwnProperty(socket.id)) {
            delete room.unnamed_players[socket.id];
        }

        if (socket.hasOwnProperty('player_idx')) {
            remove_socket_from_room(socket);
            delete socket.player_idx;
        }

        delete socket.room_id;

        if (room.state === STATE_JOINING) {
            send_player_name_update(room_id);
        }
    }
};

const handle_disconnect = function(socket) {
    handle_leave_room(socket);
};

// Tell Socket.io to start accepting connections
io.on('connection', function(socket){
    console.log("New client has connected with id:", socket.id);

    // Listen for a new room request
    socket.on('create_new_room', function(){
        handle_create_new_room(socket);
    });

    // Listen for request to join a room
    socket.on('request_room_join', function (room_id) {
        handle_request_room_join(socket, room_id);
    });

    // Listen for setting name
    socket.on('set_name', function (data) {
        console.log('socket', socket.id, 'is requesting name', data);

        check_socket_consistency(socket, data);
        handle_set_name(socket, data.new_name_request);
    });

    socket.on('start_game', function (data) {
        console.log('socket', socket.id, 'is requesting to start the game in room', socket.room_id);

        check_socket_consistency(socket, data);
        start_game(socket);
    });

    socket.on('next_hand', function (data) {
        console.log('socket', socket.id, 'is requesting to start the next hand in room', socket.room_id);

        check_socket_consistency(socket, data);
        start_hand(socket.room_id);
    });

    socket.on('pounce', function(data) {
        console.log('socket', socket.id, 'has pounced in room', socket.room_id);

        check_socket_consistency(socket, data);
        handle_pounce(socket.room_id, socket);
    });

    socket.on('request_move_to_center', function(data) {
        console.log('socket', socket.id, 'is trying to move to the center with data', data);

        check_socket_consistency(socket, data);
        handle_request_for_center(socket.room_id, socket, data);
    });

    socket.on('update_pounce_cards_remaining', function(data) {
        console.log('socket', socket.id, 'had', data.num_pounce_left, 'pounce cards left');

        check_socket_consistency(socket, data);
        record_pounce_cards_left(socket, data.num_pounce_left);
    });

    socket.on('set_ditch', function(data) {
        console.log('socket', socket.id, 'is setting their ditch value to', data.new_ditch_val);

        check_socket_consistency(socket, data);
        handle_ditch_update(socket.room_id, socket, data.new_ditch_val);
    });

    socket.on('change_players', function(data) {
        console.log('socket', socket.id, 'is changing the players in their room');

        check_socket_consistency(socket, data);
        handle_change_players(socket.room_id);
    });

    socket.on('leave_room', function(data) {
        console.log('socket', socket.id, 'is leaving their current room');

        check_socket_consistency(socket, data);
        handle_leave_room(socket);
    });

    socket.on('request_end_hand', function(data) {
        console.log('socket', socket.id, 'is ending the hand');

        check_socket_consistency(socket, data);
        handle_end_hand(socket.room_id);
    });

    socket.on('disconnect', function(){
        handle_disconnect(socket);
    });
});

