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
        let set_focus_element = set_name_input;

        /**********************************Set Card Color**********************************/

        let choose_card_div = document.createElement('div');
        join_room_div.appendChild(choose_card_div);

        // load the card back xml info
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                _create_card_back_selections(this.responseXML, choose_card_div);
            }
        };
        xmlhttp.open("GET", "/assets/imgs/playingCardBacks.xml", true);
        xmlhttp.send();

        /**************************Name Welcome and Start Button**************************/
        if (app.model.get_name() !== null) {
            let welcome_div = document.createElement('div');
            $container.append(welcome_div);

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
            $(start_game_button).click(function () {
                join_room.controller.handle_start_game();
            });

            set_focus_element = start_game_button;
        }

        update_player_list(join_room_div);

        set_focus_element.focus();
    };

    const _create_card_back_selections = function(xml, div) {
        let title_h2 = document.createElement('h2');
        div.appendChild(title_h2);
        title_h2.appendChild(document.createTextNode('Select Deck'));

        let cards_div = document.createElement('div');
        div.appendChild(cards_div);

        let subimgs = xml.getElementsByTagName("SubTexture");

        let subimg_lookup = {};
        for (let i = 0; i < subimgs.length; i++) {
            subimg_lookup[subimgs[i].attributes.name.nodeValue] = subimgs[i].attributes;
        }

        let has_deck = app.model.get_deck_back() !== null;
        for (let i = 0; i < constants.ENABLED_DECKS.length; i++) {
            if (!subimg_lookup.hasOwnProperty(constants.ENABLED_DECKS[i])) {
                continue;
            }

            let subimg = subimg_lookup[constants.ENABLED_DECKS[i]];

            let label = document.createElement('label');
            cards_div.appendChild(label);

            let radio = document.createElement('input');
            label.appendChild(radio);
            radio.setAttribute("type", "radio");
            radio.setAttribute("id", subimg.name.nodeValue);
            radio.setAttribute("name", "deck_back");
            radio.setAttribute('value', subimg.name.nodeValue);
            if (!has_deck || app.model.get_deck_back() === subimg.name.nodeValue) {
                has_deck = true;
                radio.setAttribute('checked', 'true');
                join_room.controller.handle_deck_back_change(subimg.name.nodeValue);
            }

            let img_div = document.createElement('div');
            label.appendChild(img_div);
            img_div.setAttribute('style', "display: inline-block; overflow: hidden; width: " +
                subimg.width.nodeValue + "px; height: " + subimg.height.nodeValue + "px; margin: 10px;");

            let img = document.createElement('img');
            img_div.appendChild(img);
            img.setAttribute('src', "/assets/imgs/playingCardBacks.png");
            img.setAttribute('style', "position: relative; left: -" + subimg.x.nodeValue + "px; top: -" + subimg.y.nodeValue + "px;");
        }

        $('input:radio[name="deck_back"]').change(function() {
            join_room.controller.handle_deck_back_change($(this).val());
        });
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

    const display_bad_room_page = function (room_id) {
        clear_container();

        let title_h2 = document.createElement('h2');
        $container.append(title_h2);
        title_h2.appendChild(document.createTextNode('Bad Room ID: ' + room_id));

        let info_p = document.createElement('p');
        $container.append(info_p);
        info_p.appendChild(document.createTextNode('You tried to enter a Pounce room that does not exist. Click below to return to home page.'));

        let back_button = document.createElement('button');
        $container.append(back_button);
        back_button.appendChild(document.createTextNode('Back'));

        $(back_button).click(function () {
            join_room.controller.handle_back_to_home_button();
        });
    };

    return {
        init_module: init_module,
        display_joining_room_page: display_joining_room_page,
        display_join_room_page: display_join_room_page,
        update_player_list: update_player_list,
        display_bad_room_page: display_bad_room_page
    };
}());