const game = (function () {

    const init_module = function ($container, socket) {
        game.controller.init_module(socket);
        game.model.init_module();
        game.view.init_module($container);

        socket.on('start_hand', function(data) {
            console.log('starting new hand with deck', data.deck);
            game.controller.start_hand(data.deck, data.num_players);
        });

        socket.on('round_done', function(winner) {
            alert(winner + ' Pounced!');
            game.controller.handle_hand_done();
        });
    };

    return {
        init_module: init_module
    };
}());