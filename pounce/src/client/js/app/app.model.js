app.model = (function () {

    let room_id;
    let name;

    const init_module = function () {
        clear();
    };

    const set_room_id = function(rid) {
        room_id = rid;
    };

    const get_room_id = function() {
        return room_id;
    };

    const set_name = function(n) {
        name = n;
    };

    const get_name = function() {
        return name;
    }

    const clear = function () {
        room_id = null;
        name = null;
    };

    return {
        init_module: init_module,
        set_room_id: set_room_id,
        get_room_id: get_room_id,
        set_name: set_name,
        get_name: get_name,
        clear: clear
    };
}());