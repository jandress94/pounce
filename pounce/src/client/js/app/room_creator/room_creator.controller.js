room_creator.controller = (function () {

    let socket;

    const init_module = function (s) {
        socket = s;
    };

    const display_room_creator = function() {
        room_creator.view.display_room_creator();
    };

    return {
        init_module: init_module,
        display_room_creator: display_room_creator
    };
}());