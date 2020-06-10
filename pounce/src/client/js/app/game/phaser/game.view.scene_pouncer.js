game.view.scene_pouncer = (function () {

    let SCENE_WIDTH;
    let SCENE_HEIGHT;

    let CENTER_PILE_FONT = 'Arial';
    let CENTER_PILE_TEXT_SIZE = 50;

    let TIME_ON_PAGE_SEC = 3;

    let winner;

    let has_displayed_long_enough;

    const init_module = function(w, h) {
        SCENE_WIDTH = w;
        SCENE_HEIGHT = h;

        winner = null;
    };

    const set_winner = function(w) {
        winner = w + ' pounced!';
    };

    const get_has_displayed_long_enough = function () {
        return has_displayed_long_enough;
    };

    let Scene_Pouncer = new Phaser.Class({
        Extends: Phaser.Scene,

        initialize: function Scene_Pouncer () {
            Phaser.Scene.call(this, {key: 'scene_pouncer'});
        },

        create: function () {
            this.add.text(SCENE_WIDTH / 2, SCENE_HEIGHT / 2, winner, { fontFamily: CENTER_PILE_FONT, fontSize: CENTER_PILE_TEXT_SIZE, color: '#ffffff' }).setOrigin();
            has_displayed_long_enough = false;

            var timer = this.time.addEvent({
                delay: TIME_ON_PAGE_SEC * 1000,
                callback: function() {
                    has_displayed_long_enough = true;
                },
                loop: false,
                repeat: 0,
                startAt: 0,
                timeScale: 1,
                paused: false
            });
        }
    });



    return {
        TIME_ON_PAGE_SEC: TIME_ON_PAGE_SEC,
        init_module: init_module,
        set_winner: set_winner,
        get_has_displayed_long_enough: get_has_displayed_long_enough,
        Scene_Pouncer: Scene_Pouncer
    };
}());