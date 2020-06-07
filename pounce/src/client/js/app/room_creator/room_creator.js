const room_creator = (function () {

    const init_module = function ($container, socket) {
        room_creator.controller.init_module(socket);
        room_creator.view.init_module($container);

        // socket.on()
    };

    const start = function () {
        room_creator.controller.display_room_creator();
    };

    return {
        init_module: init_module,
        start: start
    };
}());