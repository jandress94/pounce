join_room.view = (function () {

    let $container;

    const init_module = function ($c) {
        $container = $c;
    };

    const clear_container = function() {
        $container.empty();
    };

    const display_joining_room_page = function (room_id) {
        clear_container();

        let join_room_div = document.createElement('div');
        $container.append(join_room_div);

        let joining_h2 = document.createElement('h2');
        join_room_div.appendChild(joining_h2);
        joining_h2.appendChild(document.createTextNode('Joining Room ' + room_id));
    };

    const display_join_room_page = function() {
        clear_container();

        let join_room_div = document.createElement('div');
        $container.append(join_room_div);

        let title_h1 = document.createElement('h2');
        join_room_div.appendChild(title_h1);
        title_h1.appendChild(document.createTextNode("Welcome to Pounce room " + app.model.get_room_id()));

        /*************************************Set Name*************************************/

        let set_name_div = document.createElement('div');
        join_room_div.appendChild(set_name_div);

        let set_name_input = document.createElement('input');
        set_name_div.appendChild(set_name_input);

        let set_name_button = document.createElement('button');
        set_name_div.appendChild(set_name_button);
        set_name_button.appendChild(document.createTextNode('Set Name'));
        $(set_name_button).click(function () {
            join_room.controller.handle_set_name(set_name_input.value);
        });
        set_name_input.addEventListener("keyup", function(event) {
            if (event.key === "Enter") {
                join_room.controller.handle_set_name(set_name_input.value);
            }
        });

        update_player_list(join_room_div);
    };

    const display_welcome = function () {
        clear_container();

        let welcome_div = document.createElement('div');
        $container.append(welcome_div);

        let title_h2 = document.createElement('h2');
        welcome_div.appendChild(title_h2);
        title_h2.appendChild(document.createTextNode("Welcome to Pounce room " + app.model.get_room_id()));

        let name_div = document.createElement('div');
        welcome_div.appendChild(name_div);

        let welcome_h2 = document.createElement('h2');
        name_div.appendChild(welcome_h2);
        welcome_h2.appendChild(document.createTextNode('Welcome ' + app.model.get_name()));

        let start_game_div = document.createElement('div');
        welcome_div.appendChild(start_game_div);

        let start_game_button = document.createElement('button');
        start_game_div.appendChild(start_game_button);
        start_game_button.appendChild(document.createTextNode('Start Game'));
        start_game_button.focus();
        $(start_game_button).click(function () {
            join_room.controller.handle_start_game();
        });

        update_player_list(welcome_div);
    };

    const update_player_list = function (player_list_container) {
        let player_list = $("#player_list");
        if (player_list.length === 0) {
            // Create the new player list area
            player_list_container = player_list_container || $container;

            let player_list_div = document.createElement('div');
            try {
                player_list_container.appendChild(player_list_div);
            } catch (err) {
                player_list_container.append(player_list_div);
            }

            let player_list_title = document.createElement('h2');
            player_list_div.appendChild(player_list_title);
            player_list_title.appendChild(document.createTextNode('Players'));

            player_list = document.createElement('ul');
            player_list_div.appendChild(player_list);
            player_list.id = 'player_list';
        } else {
            player_list = player_list[0];
        }

        player_list.innerHTML = '';

        for (let i = 0; i < app.model.get_players().length; i++) {
            let player_li = document.createElement('li');
            player_list.appendChild(player_li);
            player_li.appendChild(document.createTextNode(app.model.get_players()[i] || 'Anonymous Player'));
        }
    };

    return {
        init_module: init_module,
        display_joining_room_page: display_joining_room_page,
        display_join_room_page: display_join_room_page,
        display_welcome: display_welcome,
        update_player_list: update_player_list
    };
}());