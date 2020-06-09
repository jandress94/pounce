game.controller = (function () {

    let socket;

    const init_module = function (s) {
        socket = s;
    };

    const start_hand = function(deck, num_players) {
        game.model.start_hand_w_deck(deck, num_players);
        game.view.create_initial_game();
    };

    const handle_click_hand_draw = function () {
        game.model.cycle_deck();
    };

    const register_pounce = function () {
        socket.emit('pounce');
    };

    const handle_hand_done = function() {
        game.view.clear_container();
    };

    const handle_move_to_build_pile = function(click_metadata, build_pile_idx) {
        game.model.move_to_build_pile(click_metadata, build_pile_idx);
    };

    const handle_move_to_center_pile = function(click_metadata, center_pile_coords) {
        if (game.model.check_move_to_center(click_metadata, center_pile_coords)) {
            game.model.set_center_click_metadata(click_metadata);
            game.view.pause_game();
            socket.emit('request_move_to_center', {
                center_pile_coords: center_pile_coords,
                center_card_old_val: game.model.get_center_piles()[center_pile_coords[0]][center_pile_coords[1]]
            });
        }
    };

    const handle_center_move_feedback = function(accepted) {
        game.view.resume_game();
        game.model.process_center_click_metadata(accepted);
    };

    const update_center = function(center_data) {
        game.model.process_update_center(center_data);
    };

    return {
        init_module: init_module,
        start_hand: start_hand,
        handle_click_hand_draw: handle_click_hand_draw,
        register_pounce: register_pounce,
        handle_hand_done: handle_hand_done,
        handle_move_to_build_pile: handle_move_to_build_pile,
        handle_move_to_center_pile: handle_move_to_center_pile,
        handle_center_move_feedback: handle_center_move_feedback,
        update_center: update_center
    };
}());