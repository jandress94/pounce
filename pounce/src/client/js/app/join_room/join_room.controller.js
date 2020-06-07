join_room.controller = (function () {

    let socket;

    const init_module = function (s) {
        socket = s;
    };

    const request_to_join_room = function (room_id) {
        console.log('requesting to join room', room_id);
        join_room.view.display_joining_room_page(room_id);
        socket.emit('request_room_join', room_id);

        // app.model.set_room_id(room_id);
        // join_room.controller.display_join_room();
    };

    const display_join_room_page = function () {
        join_room.view.display_join_room_page();
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
        request_to_join_room: request_to_join_room,
        display_join_room_page: display_join_room_page
    };
}());