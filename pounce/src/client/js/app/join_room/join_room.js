const join_room = (function () {

    const init_module = function ($container, socket) {
        join_room.controller.init_module(socket);
        join_room.view.init_module($container);

        socket.on('new_room_created', function(room_id) {
            console.log('new room was created with id', room_id);
        });
    };

    const start = function () {
        join_room.controller.display_join_room();
    };

    return {
        init_module: init_module,
        start: start
    };
}());