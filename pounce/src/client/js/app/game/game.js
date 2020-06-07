const game = (function () {

    const init_module = function ($container, socket) {
        game.controller.init_module(socket);
        game.model.init_module();
        game.view.init_module($container);

        socket.on('start_hand', function(deck) {
            console.log('starting new hand with deck', deck);
            game.controller.start_hand(deck);
        });
    };

    return {
        init_module: init_module
    };
}());