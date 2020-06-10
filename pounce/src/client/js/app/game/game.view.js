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

    return {
        init_module: init_module,
        create_initial_game: create_initial_game,
        clear_container: clear_container,
        pause_game: pause_game,
        resume_game: resume_game,
        switch_to_pouncer_scene: switch_to_pouncer_scene
    };
}());