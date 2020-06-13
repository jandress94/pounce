game.view.phaser_game = (function () {

    let SCENE_WIDTH = 800;
    let SCENE_HEIGHT = 600;

    let phaser_game;

    const init_module = function () {
        game.view.scene_pounce.init_module(SCENE_WIDTH, SCENE_HEIGHT);
        game.view.scene_pouncer.init_module(SCENE_WIDTH, SCENE_HEIGHT);
        game.view.scene_scores.init_module(SCENE_WIDTH, SCENE_HEIGHT);

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
                game.view.scene_pouncer.Scene_Pouncer,
                game.view.scene_scores.Scene_Scores
            ]
        };

        phaser_game = new Phaser.Game(config);
    };

    const switch_to_pouncer_scene = function (message) {
        game.view.scene_pouncer.set_message(message);
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

    const switch_to_scores = function () {
        phaser_game.scene.stop('scene_pouncer');
        phaser_game.scene.start('scores');
    };

    const display_scores = function(scores_data, post_display_callback) {
        game.view.scene_scores.update_scores(scores_data);

        if (game.view.scene_pouncer.get_has_displayed_long_enough()) {
            switch_to_scores();
            post_display_callback();
        } else {
            let callback = function () {
                switch_to_scores();
                post_display_callback();
            };

            phaser_game.scene.getScene('scene_pouncer').time.addEvent({
                delay: game.view.scene_pouncer.TIME_ON_PAGE_SEC * 1000,
                callback: callback,
                loop: false,
                repeat: 0,
                startAt: 0,
                timeScale: 1,
                paused: false
            });
        }
    };

    return {
        init_module: init_module,
        create_game: create_game,
        pause_game: pause_game,
        resume_game: resume_game,
        switch_to_pouncer_scene: switch_to_pouncer_scene,
        display_scores: display_scores
    };
}());