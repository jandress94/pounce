const join_room = (function () {

    const init_module = function ($container, socket) {
        join_room.controller.init_module(socket);
        join_room.view.init_module($container);

        socket.on('new_room_created', function(room_id) {
            console.log('new room was created with id', room_id);
            window.history.pushState(null, null, "/room/" + room_id);

            start(room_id);
        });

        socket.on('confirm_room_join', function(room_id) {
            console.log('received confirmation for joining room', room_id);
            app.model.set_room_id(room_id);
            join_room.controller.display_join_room_page();
        });

        socket.on('reject_name', function() {
            alert('Name already taken, choose another.');
        });

        socket.on('accept_name', function(name) {
            app.model.set_name(name);
            join_room.controller.display_welcome();
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