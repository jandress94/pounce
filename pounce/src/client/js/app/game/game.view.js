game.view = (function () {

    let $container;

    let end_hand_div;
    let next_hand_div;
    let post_game_buttons_div;

    let is_set;

    const init_module = function ($c) {
        $container = $c;
        end_hand_div = null;
        next_hand_div = null;
        post_game_buttons_div = null;
        game.view.phaser_game.init_module();
        is_set = false;
    };

    const clear_container = function() {
        $container.empty();
        end_hand_div = null;
        next_hand_div = null;
        post_game_buttons_div = null;
    };

    const is_setup = function () {
        return is_set && document.getElementById('phaser_game_div') !== null;
    };

    const ensure_setup = function() {
        if (!is_setup()) {
            set_up();
        }
    };

    const set_up = function() {
        is_set = true;
        clear_container();

        let game_div = document.createElement('div');
        game_div.id = 'phaser_game_div';
        $container.append(game_div);

        // end hand

        end_hand_div = document.createElement('div');
        end_hand_div.style.visibility = 'hidden';
        $container.append(end_hand_div);

        let end_hand_button = document.createElement('button');
        end_hand_div.appendChild(end_hand_button);
        end_hand_button.appendChild(document.createTextNode('End Hand'));
        $(end_hand_button).click(function() {
            game.controller.handle_end_hand_button();
        });

        // next hand

        next_hand_div = document.createElement('div');
        next_hand_div.style.visibility = 'hidden';
        $container.append(next_hand_div);

        let next_hand_button = document.createElement('button');
        next_hand_div.appendChild(next_hand_button);
        next_hand_button.appendChild(document.createTextNode('Next Hand'));
        $(next_hand_button).click(function () {
            game.controller.handle_next_hand_button();
        });

        // post game buttons

        post_game_buttons_div = document.createElement('div');
        post_game_buttons_div.style.visibility = 'hidden';
        $container.append(post_game_buttons_div);

        let play_again_button = document.createElement('button');
        post_game_buttons_div.appendChild(play_again_button);
        play_again_button.appendChild(document.createTextNode('Play Again'));
        $(play_again_button).click(function() {
            game.controller.handle_play_again_button();
        });

        let change_players_button = document.createElement('button');
        post_game_buttons_div.appendChild(change_players_button);
        change_players_button.appendChild(document.createTextNode('Change Players'));
        $(change_players_button).click(function() {
            game.controller.handle_change_players_button();
        });

        let back_to_home_button = document.createElement("button");
        post_game_buttons_div.appendChild(back_to_home_button);
        back_to_home_button.appendChild(document.createTextNode('Back to Home Page'));
        $(back_to_home_button).click(function() {
            game.controller.handle_back_to_home_button();
        });

        game.view.phaser_game.create_game(game_div);
    };

    const start_hand_scene = function() {
        ensure_setup();

        end_hand_div.style.visibility = 'hidden';
        next_hand_div.style.visibility = 'hidden';
        post_game_buttons_div.style.visibility = 'hidden';

        game.view.phaser_game.start_hand_scene();
    };

    const switch_to_pouncer_scene = function (message) {
        ensure_setup();

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
        ensure_setup();

        let game_finished = false;
        for (let p in scores_data) {
            if (scores_data.hasOwnProperty(p)) {
                if (scores_data[p].end_score >= constants.POINTS_TO_WIN) {
                    game_finished = true;
                    break;
                }
            }
        }

        let button_div_to_show;
        if (game_finished) {
            button_div_to_show = post_game_buttons_div;
        } else {
            button_div_to_show = next_hand_div;
        }

        game.view.phaser_game.display_scores(scores_data, function() {button_div_to_show.style.visibility = 'visible'});
    };

    const add_end_hand_button = function() {
        end_hand_div.style.visibility = 'visible';
    };

    return {
        init_module: init_module,
        start_hand_scene: start_hand_scene,
        pause_game: pause_game,
        resume_game: resume_game,
        switch_to_pouncer_scene: switch_to_pouncer_scene,
        display_scores: display_scores,
        add_end_hand_button: add_end_hand_button
    };
}());