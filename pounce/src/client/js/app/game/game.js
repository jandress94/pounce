const game = (function () {

    const init_module = function ($container, socket) {
        game.controller.init_module(socket);
        game.model.init_module();
        game.view.init_module($container);

        socket.on('start_hand', function(data) {
            console.log('starting new hand with deck', data.deck);
            game.controller.start_hand(data.deck, data.num_players);
        });

        socket.on('hand_done', function(winner) {
            console.log(winner + ' Pounced!');
            game.controller.handle_hand_done(winner);
        });

        socket.on('accept_request_move_to_center', function() {
            console.log('request to move to center accepted');
            game.controller.handle_center_move_feedback(true);
        });

        socket.on('reject_request_move_to_center', function() {
            console.log('request to move to center rejected');
            game.controller.handle_center_move_feedback(false);
        });

        socket.on('update_center', function(center_data) {
            console.log('new center pile value', center_data);
            game.controller.update_center(center_data);
        });

        socket.on('update_scores', function(scores_data) {
            console.log('scores updated', scores_data);
            game.controller.update_scores();
        })
    };

    return {
        init_module: init_module
    };
}());