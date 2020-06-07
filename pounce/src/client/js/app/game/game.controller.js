game.controller = (function () {

    let socket;

    const init_module = function (s) {
        socket = s;
    };

    const start_hand = function(deck) {
        game.model.start_hand_w_deck(deck);
        game.view.create_initial_game();
    };

    return {
        init_module: init_module,
        start_hand: start_hand
    };
}());