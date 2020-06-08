game.controller = (function () {

    let socket;

    const init_module = function (s) {
        socket = s;
    };

    const start_hand = function(deck) {
        game.model.start_hand_w_deck(deck);
        game.view.create_initial_game();
    };

    const handle_click_hand_draw = function () {
        game.model.cycle_deck();
    };

    return {
        init_module: init_module,
        start_hand: start_hand,
        handle_click_hand_draw: handle_click_hand_draw
    };
}());