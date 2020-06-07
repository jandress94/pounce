room_creator.view = (function () {

    let $container;

    const init_module = function ($c) {
        $container = $c;
    };

    const clear_container = function() {
        $container.empty();
    };

    const display_room_creator = function() {
        clear_container();

        let room_creator_div = document.createElement('div');
        $container.append(room_creator_div);

        room_creator_div.appendChild(document.createTextNode('Create Room'));
    };

    return {
        init_module: init_module,
        display_room_creator: display_room_creator
    };
}());