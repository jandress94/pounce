game.view.scene_pouncer = (function () {

    let SCENE_WIDTH;
    let SCENE_HEIGHT;

    let CENTER_PILE_FONT = 'Arial';
    let CENTER_PILE_TEXT_SIZE = 50;

    let winner;

    const init_module = function(w, h) {
        SCENE_WIDTH = w;
        SCENE_HEIGHT = h;

        winner = null;
    };

    const set_winner = function(w) {
        winner = w + ' pounced!';
    };

    let Scene_Pouncer = new Phaser.Class({
        Extends: Phaser.Scene,

        initialize: function Scene_Pouncer () {
            Phaser.Scene.call(this, {key: 'scene_pouncer'});
        },

        create: function () {
            this.add.text(SCENE_WIDTH / 2, SCENE_HEIGHT / 2, winner, { fontFamily: CENTER_PILE_FONT, fontSize: CENTER_PILE_TEXT_SIZE, color: '#ffffff' }).setOrigin();
        }
    });

    return {
        init_module: init_module,
        set_winner: set_winner,
        Scene_Pouncer: Scene_Pouncer
    };
}());