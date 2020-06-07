game.view = (function () {

    let $container;

    const init_module = function ($c) {
        $container = $c;
    };

    const clear_container = function() {
        $container.empty();
    };

    const create_initial_game = function () {
        clear_container();

        $container.append(document.createTextNode(JSON.stringify(game.model.get_first_pounce_card())));
    };

    return {
        init_module: init_module,
        create_initial_game: create_initial_game
    };
}());