room_creator.controller = (function () {

    let socket;

    const init_module = function (s) {
        socket = s;
    };

    const display_room_creator = function() {
        room_creator.view.display_room_creator();
    };

    const handle_new_room_button_clicked = function () {
        console.log('Creating new room');
        socket.emit('create_new_room');
    };

    const handle_join_room_button_clicked = function (room_id) {
        window.history.pushState(null, null, "/room/" + room_id);
        join_room.start(room_id);
    };

    return {
        init_module: init_module,
        display_room_creator: display_room_creator,
        handle_new_room_button_clicked: handle_new_room_button_clicked,
        handle_join_room_button_clicked: handle_join_room_button_clicked
    };
}());