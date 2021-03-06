join_room.controller = (function () {

    let socket;

    const init_module = function (s) {
        socket = s;
    };

    const request_to_join_room = function (room_id) {
        console.log('requesting to join room', room_id);
        join_room.view.display_joining_room_page(room_id);
        socket.emit('request_room_join', room_id);
    };

    const display_join_room_page = function () {
        join_room.view.display_join_room_page();
    };

    const handle_set_name = function (name) {
        console.log('requesting name', name);

        let data = app.model.get_id_info();
        data.new_name_request = name;
        socket.emit('set_name', data);
    };

    const handle_update_players = function () {
        join_room.view.update_player_list();
    };

    const handle_start_game = function () {
        socket.emit('start_game', app.model.get_id_info());
    };

    const display_bad_room_page = function(room_id) {
        join_room.view.display_bad_room_page(room_id);
    };

    const handle_back_to_home_button = function () {
        window.history.pushState(null, null, "/");
        room_creator.start();
    };

    const handle_deck_back_change = function (deck_back) {
        app.model.set_deck_back(deck_back);
    };

    return {
        init_module: init_module,
        request_to_join_room: request_to_join_room,
        display_join_room_page: display_join_room_page,
        handle_set_name: handle_set_name,
        handle_update_players: handle_update_players,
        handle_start_game: handle_start_game,
        display_bad_room_page: display_bad_room_page,
        handle_back_to_home_button: handle_back_to_home_button,
        handle_deck_back_change: handle_deck_back_change
    };
}());