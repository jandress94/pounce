game.view = (function () {

    let $container;
    let end_hand_div;

    let has_created_game;

    const init_module = function ($c) {
        $container = $c;
        end_hand_div = null;
        game.view.phaser_game.init_module();

        has_created_game = false;
    };

    const clear_container = function() {
        $container.empty();
        end_hand_div = null;
    };

    const ensure_has_created_game = function() {
        if (!has_created_game) {
            create_initial_game();
        }
    };

    const create_initial_game = function () {
        has_created_game = true;
        clear_container();

        let game_div = document.createElement('div');
        $container.append(game_div);

        end_hand_div = document.createElement('div');
        end_hand_div.style.visibility = 'hidden';
        $container.append(end_hand_div);

        let end_hand_button = document.createElement('button');
        end_hand_div.appendChild(end_hand_button);
        end_hand_button.appendChild(document.createTextNode('End Hand'));
        $(end_hand_button).click(function() {
            game.controller.handle_end_hand_button();
        });

        game.view.phaser_game.create_game(game_div);
    };

    const switch_to_pouncer_scene = function (message) {
        ensure_has_created_game();
        end_hand_div.style.visibility = 'hidden';
        game.view.phaser_game.switch_to_pouncer_scene(message);
    };

    const pause_game = function() {
        game.view.phaser_game.pause_game();
    };

    const resume_game = function() {
        game.view.phaser_game.resume_game();
    };

    const display_scores = function(scores_data) {
        ensure_has_created_game();
        let button_div = document.createElement('div');
        button_div.style.visibility = 'hidden';
        $container.append(button_div);

        let game_finished = false;
        for (let p in scores_data) {
            if (scores_data.hasOwnProperty(p)) {
                if (scores_data[p].end_score >= constants.POINTS_TO_WIN) {
                    game_finished = true;
                    break;
                }
            }
        }

        if (game_finished) {
            let play_again_button = document.createElement('button');
            button_div.appendChild(play_again_button);
            play_again_button.appendChild(document.createTextNode('Play Again'));
            $(play_again_button).click(function() {
                game.controller.handle_play_again_button();
            });

            let change_players_button = document.createElement('button');
            button_div.appendChild(change_players_button);
            change_players_button.appendChild(document.createTextNode('Change Players'));
            $(change_players_button).click(function() {
                game.controller.handle_change_players_button();
            });

            let back_to_home_button = document.createElement("button");
            button_div.appendChild(back_to_home_button);
            back_to_home_button.appendChild(document.createTextNode('Back to Home Page'));
            $(back_to_home_button).click(function() {
                game.controller.handle_back_to_home_button();
            });
        } else {
            let next_hand_button = document.createElement('button');
            button_div.appendChild(next_hand_button);
            next_hand_button.appendChild(document.createTextNode('Next Hand'));
            $(next_hand_button).click(function () {
                game.controller.handle_next_hand_button();
            });
        }

        game.view.phaser_game.display_scores(scores_data, function() {button_div.style.visibility = 'visible'});
    };

    const add_end_hand_button = function() {
        end_hand_div.style.visibility = 'visible';
    };

    return {
        init_module: init_module,
        create_initial_game: create_initial_game,
        clear_container: clear_container,
        pause_game: pause_game,
        resume_game: resume_game,
        switch_to_pouncer_scene: switch_to_pouncer_scene,
        display_scores: display_scores,
        add_end_hand_button: add_end_hand_button
    };
}());