game.view = (function () {

    let $container;

    const init_module = function ($c) {
        $container = $c;
        game.view.phaser.init_module();
    };

    const clear_container = function() {
        $container.empty();
    };

    const create_initial_game = function () {
        clear_container();

        // $container.append(document.createTextNode(JSON.stringify(game.model.get_first_pounce_card())));
        let game_div = document.createElement('div');
        $container.append(game_div);

        game.view.phaser.create_game(game_div);
    };

    return {
        init_module: init_module,
        create_initial_game: create_initial_game,
        clear_container: clear_container
    };
}());