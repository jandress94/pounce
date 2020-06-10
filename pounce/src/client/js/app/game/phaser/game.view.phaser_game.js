game.view.phaser_game = (function () {

    let SCENE_WIDTH = 800;
    let SCENE_HEIGHT = 600;

    let phaser_game;

    const init_module = function () {
        game.view.scene_pounce.init_module(SCENE_WIDTH, SCENE_HEIGHT);
        game.view.scene_pouncer.init_module(SCENE_WIDTH, SCENE_HEIGHT);

        phaser_game = null;
    };

    const create_game = function (game_div) {
        var config = {
            type: Phaser.AUTO,
            width: SCENE_WIDTH,
            height: SCENE_HEIGHT,
            parent: game_div,
            scene: [
                game.view.scene_pounce.Scene_Pounce,
                game.view.scene_pouncer.Scene_Pouncer
            ]
        };

        phaser_game = new Phaser.Game(config);
    };

    const switch_to_pouncer_scene = function (winner) {
        game.view.scene_pouncer.set_winner(winner);
        phaser_game.scene.stop('scene_pounce');
        phaser_game.scene.start('scene_pouncer');
    };

    const pause_game = function() {
        phaser_game.scene.pause();
        phaser_game.input.enabled = false;
    };

    const resume_game = function() {
        phaser_game.scene.resume();
        phaser_game.input.enabled = true;
    };

    return {
        init_module: init_module,
        create_game: create_game,
        pause_game: pause_game,
        resume_game: resume_game,
        switch_to_pouncer_scene: switch_to_pouncer_scene
    };
}());