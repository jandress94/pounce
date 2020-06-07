const app = (function () {

    const init_module = function ($container, socket) {
        console.log('starting app');

        room_creator.init_module($container, socket);
        room_creator.start();
    };

    return {
        init_module: init_module
    };
}());