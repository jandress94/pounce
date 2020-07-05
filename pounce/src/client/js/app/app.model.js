app.model = (function () {

    let room_id;
    let name;
    let players;
    let deck_back;

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

    const get_deck_back = function() {
        return deck_back;
    };

    const set_deck_back = function(db) {
        deck_back = db;
    };

    const clear = function () {
        room_id = null;
        name = null;
        players = [];
        deck_back = null;
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
        set_deck_back: set_deck_back,
        get_deck_back: get_deck_back,
        clear: clear,
        get_id_info: get_id_info
    };
}());