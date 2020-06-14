app.model = (function () {

    let room_id;
    let name;
    let players;

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
    };

    const set_players = function (p) {
        players = p;
    };

    const get_players = function() {
        return players;
    };

    const clear = function () {
        room_id = null;
        name = null;
        players = [];
    };

    const get_id_info = function() {
        return {
            room_id: room_id,
            player_name: name
        };
    };

    return {
        init_module: init_module,
        set_room_id: set_room_id,
        get_room_id: get_room_id,
        set_name: set_name,
        get_name: get_name,
        set_players: set_players,
        get_players: get_players,
        clear: clear,
        get_id_info: get_id_info
    };
}());