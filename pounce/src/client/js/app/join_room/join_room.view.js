join_room.view = (function () {

    let $container;

    const init_module = function ($c) {
        $container = $c;
    };

    const clear_container = function() {
        $container.empty();
    };

    const display_join_room = function() {
        clear_container();

        // let room_creator_div = document.createElement('div');
        // $container.append(room_creator_div);
        //
        // let title_h1 = document.createElement('h1');
        // room_creator_div.appendChild(title_h1);
        // title_h1.appendChild(document.createTextNode("Jim's Pounce App"));
        //
        // /*************************************New Room*************************************/
        //
        // let new_room_div = document.createElement('div');
        // room_creator_div.appendChild(new_room_div);
        //
        // let new_room_header = document.createElement('h2');
        // new_room_div.appendChild(new_room_header);
        // new_room_header.appendChild(document.createTextNode('Create New Pounce Room'));
        //
        // let new_room_info_p = document.createElement('p');
        // new_room_div.appendChild(new_room_info_p);
        // new_room_info_p.appendChild(document.createTextNode('Press the button below to create a new Pounce room.'));
        //
        // let new_room_button = document.createElement('button');
        // new_room_div.appendChild(new_room_button);
        // new_room_button.appendChild(document.createTextNode('Create New Room'));
        // $(new_room_button).click(function() {
        //     room_creator.controller.handle_new_room_button_clicked();
        // });
    };

    return {
        init_module: init_module,
        display_join_room: display_join_room
    };
}());