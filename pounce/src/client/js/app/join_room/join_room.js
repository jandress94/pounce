const join_room = (function () {

    const init_module = function ($container, socket) {
        join_room.controller.init_module(socket);
        join_room.view.init_module($container);

        socket.on('new_room_created', function(room_id) {
            console.log('new room was created with id', room_id);
            window.history.pushState(null, null, "/room/" + room_id);

            start(room_id);
        });

        socket.on('bad_room_id', function(room_id) {
            console.log('room_id', room_id, 'does not exist');

            join_room.controller.display_bad_room_page(room_id);
        });

        socket.on('confirm_room_join', function(join_data) {
            console.log('received confirmation for joining room', join_data.room_id, 'with name', join_data.player_name);
            app.model.set_room_id(join_data.room_id);

            if (join_data.player_name !== null) {
                app.model.set_name(join_data.player_name);
            }

            join_room.controller.display_join_room_page();
        });

        socket.on('reject_name', function() {
            alert('Name already taken, choose another.');
        });

        socket.on('accept_name', function(name) {
            app.model.set_name(name);
            join_room.controller.display_join_room_page();
        });

        socket.on('update_players', function(player_names) {
            console.log(player_names);
            app.model.set_players(player_names);
            join_room.controller.handle_update_players();
        });

        socket.on('start_game_rejected', function(reason) {
            alert("Cannot start game: " + reason);
        });
    };

    const start = function (room_id) {
        join_room.controller.request_to_join_room(room_id);
    };

    return {
        init_module: init_module,
        start: start
    };
}());