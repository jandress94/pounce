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

        /*************************************New Room*************************************/

        let new_room_div = document.createElement('div');
        room_creator_div.appendChild(new_room_div);

        let new_room_header = document.createElement('h2');
        new_room_div.appendChild(new_room_header);
        new_room_header.appendChild(document.createTextNode('Create New Pounce Room'));

        let new_room_info_p = document.createElement('p');
        new_room_div.appendChild(new_room_info_p);
        new_room_info_p.appendChild(document.createTextNode('Press the button below to create a new Pounce room.'));

        let new_room_button = document.createElement('button');
        new_room_div.appendChild(new_room_button);
        new_room_button.appendChild(document.createTextNode('Create New Room'));
        $(new_room_button).click(function() {
            room_creator.controller.handle_new_room_button_clicked();
        });

        /*************************************Join Room*************************************/

        let join_room_div = document.createElement('div');
        room_creator_div.appendChild(join_room_div);

        let join_room_header = document.createElement('h2');
        join_room_div.appendChild(join_room_header);
        join_room_header.appendChild(document.createTextNode('Join Existing Pounce Room'));

        let join_room_info_p = document.createElement('p');
        join_room_div.appendChild(join_room_info_p);
        join_room_info_p.appendChild(document.createTextNode('Enter the code for the room you wish to join'));

        let room_code_input = document.createElement('input');
        join_room_div.appendChild(room_code_input);
        room_code_input.addEventListener("keyup", function(event) {
            if (event.key === "Enter") {
                room_creator.controller.handle_join_room_button_clicked(room_code_input.value);
            }
        });

        let join_room_button = document.createElement('button');
        join_room_div.appendChild(join_room_button);
        join_room_button.appendChild(document.createTextNode('Join Room'));
        $(join_room_button).click(function() {
            room_creator.controller.handle_join_room_button_clicked(room_code_input.value);
        });
    };

    return {
        init_module: init_module,
        display_room_creator: display_room_creator
    };
}());