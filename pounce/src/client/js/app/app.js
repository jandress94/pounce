const app = (function () {

    const init_module = function ($container, socket) {
        console.log('starting app');

        room_creator.init_module($container, socket);
        join_room.init_module($container, socket);

        let room_id = window.location.href.match(/room\/([a-z0-9]{5})/);

        if (room_id !== null) {
            console.log('room id is', room_id[1]);
            join_room.start();
        } else {
            room_creator.start();
        }
    };

    return {
        init_module: init_module
    };
}());