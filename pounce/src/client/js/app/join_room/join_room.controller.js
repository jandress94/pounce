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
        socket.emit('set_name', name);
    };

    const display_welcome = function () {
        join_room.view.display_welcome();
    };

    return {
        init_module: init_module,
        request_to_join_room: request_to_join_room,
        display_join_room_page: display_join_room_page,
        handle_set_name: handle_set_name,
        display_welcome: display_welcome
    };
}());