game.view.scene_scores = (function () {

    let SCENE_WIDTH;
    let SCENE_HEIGHT;

    let CENTER_PILE_FONT = 'Arial';
    let CENTER_PILE_TEXT_SIZE = 50;

    let winner;

    const init_module = function(w, h) {
        SCENE_WIDTH = w;
        SCENE_HEIGHT = h;

        winner = 'SCORES!';
    };

    let Scene_Scores = new Phaser.Class({
        Extends: Phaser.Scene,

        initialize: function Scene_Scores () {
            Phaser.Scene.call(this, {key: 'scores'});
        },

        create: function () {
            this.add.text(SCENE_WIDTH / 2, SCENE_HEIGHT / 2, winner, { fontFamily: CENTER_PILE_FONT, fontSize: CENTER_PILE_TEXT_SIZE, color: '#ffffff' }).setOrigin();
        }
    });



    return {
        init_module: init_module,
        Scene_Scores: Scene_Scores
    };
}());