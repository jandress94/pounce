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

    const handle_hand_done = function(winner) {
        socket.emit('update_pounce_cards_remaining', game.model.get_num_pounce_cards_left());
        game.view.switch_to_pouncer_scene(winner);
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

    const update_scores = function(scores_data) {
        game.view.display_scores(scores_data);
    };

    const handle_ditch_button_clicked = function() {
        game.model.flip_ditch();
    };

    const handle_ditch_changed = function(new_ditch_val) {
        console.log('sending message setting ditch to', new_ditch_val);
        socket.emit('set_ditch', new_ditch_val);
    };

    const handle_ditch = function() {
        game.model.ditch();
    };

    const handle_next_hand_button = function() {
        socket.emit('next_hand');
    };

    const handle_change_players_button = function () {
        socket.emit('change_players');
    };

    const handle_play_again_button = function() {
        socket.emit('start_game');
    };

    const handle_back_to_home_button = function() {
        window.history.pushState(null, null, "/");
        room_creator.start();
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
        update_center: update_center,
        update_scores: update_scores,
        handle_ditch_button_clicked: handle_ditch_button_clicked,
        handle_ditch_changed: handle_ditch_changed,
        handle_ditch: handle_ditch,
        handle_next_hand_button: handle_next_hand_button,
        handle_change_players_button: handle_change_players_button,
        handle_play_again_button: handle_play_again_button,
        handle_back_to_home_button: handle_back_to_home_button
    };
}());