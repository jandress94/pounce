const room_creator = (function () {

    const init_module = function ($container, socket) {
        room_creator.controller.init_module(socket);
        room_creator.view.init_module($container);

        socket.on('new_room_created', function(room_id) {
            console.log('new room was created with id', room_id);
        });
    };

    const start = function () {
        room_creator.controller.display_room_creator();
    };

    return {
        init_module: init_module,
        start: start
    };
}());