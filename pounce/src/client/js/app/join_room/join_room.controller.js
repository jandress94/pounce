join_room.controller = (function () {

    let socket;

    const init_module = function (s) {
        socket = s;
    };

    const display_join_room = function () {
        join_room.view.display_join_room();
    };

    // const display_room_creator = function() {
    //     join_room.view.display_room_creator();
    // };
    //
    // const handle_new_room_button_clicked = function () {
    //     console.log('Creating new room');
    //     socket.emit('create_new_room');
    // };

    return {
        init_module: init_module,
        display_join_room: display_join_room
    };
}());