app.model = (function () {

    let room_id;

    const init_module = function () {
        room_id = null;
    };

    const set_room_id = function(rid) {
        room_id = rid;
    };

    const get_room_id = function() {
        return room_id;
    };

    const clear = function () {
        room_id = null;
    };

    return {
        init_module: init_module,
        set_room_id: set_room_id,
        get_room_id: get_room_id,
        clear: clear
    };
}());