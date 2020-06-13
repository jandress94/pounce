game.view = (function () {

    let $container;

    const init_module = function ($c) {
        $container = $c;
        game.view.phaser_game.init_module();
    };

    const clear_container = function() {
        $container.empty();
    };

    const create_initial_game = function () {
        clear_container();

        let game_div = document.createElement('div');
        $container.append(game_div);

        game.view.phaser_game.create_game(game_div);
    };

    const switch_to_pouncer_scene = function (winner) {
        game.view.phaser_game.switch_to_pouncer_scene(winner);
    };

    const pause_game = function() {
        game.view.phaser_game.pause_game();
    };

    const resume_game = function() {
        game.view.phaser_game.resume_game();
    };

    const display_scores = function(scores_data) {
        game.view.phaser_game.display_scores(scores_data);

        let button_div = document.createElement('div');
        $container.append(button_div);

        let game_finished = false;
        for (let p in scores_data) {
            if (scores_data.hasOwnProperty(p)) {
                if (scores_data[p].end_score >= game.model.NUM_POINTS_TO_WIN) {
                    game_finished = true;
                    break;
                }
            }
        }

        if (game_finished) {
            let change_players_button = document.createElement('button');
            button_div.appendChild(change_players_button);
            change_players_button.appendChild(document.createTextNode('Change Players'));
            $(change_players_button).click(function() {
                game.controller.handle_change_players_button();
            });

            let play_again_button = document.createElement('button');
            button_div.appendChild(play_again_button);
            play_again_button.appendChild(document.createTextNode('Play Again'));
            $(play_again_button).click(function() {
                game.controller.handle_play_again_button();
            });
        } else {
            let next_hand_button = document.createElement('button');
            button_div.appendChild(next_hand_button);
            next_hand_button.appendChild(document.createTextNode('Next Hand'));
            $(next_hand_button).click(function () {
                game.controller.handle_next_hand_button();
            });
        }
    };

    return {
        init_module: init_module,
        create_initial_game: create_initial_game,
        clear_container: clear_container,
        pause_game: pause_game,
        resume_game: resume_game,
        switch_to_pouncer_scene: switch_to_pouncer_scene,
        display_scores: display_scores
    };
}());