game.view.scene_scores = (function () {

    let SCENE_WIDTH;
    let SCENE_HEIGHT;

    let CENTER_PILE_FONT = 'Arial';
    let CENTER_PILE_TEXT_SIZE = 12;

    let scores_data;

    const init_module = function(w, h) {
        SCENE_WIDTH = w;
        SCENE_HEIGHT = h;
    };

    const update_scores = function(scores) {
        scores_data = scores;
    };

    let Scene_Scores = new Phaser.Class({
        Extends: Phaser.Scene,

        initialize: function Scene_Scores () {
            Phaser.Scene.call(this, {key: 'scores'});
        },

        create: function () {
            let player_cnt = 0;
            for (var p in scores_data) {
                if (scores_data.hasOwnProperty(p)) {
                    player_cnt++;
                    this.add.text(SCENE_WIDTH / 2, player_cnt * 100, p + ": " + JSON.stringify(scores_data[p]), { fontFamily: CENTER_PILE_FONT, fontSize: CENTER_PILE_TEXT_SIZE, color: '#ffffff' }).setOrigin();
                }
            }
        }
    });

    return {
        init_module: init_module,
        update_scores: update_scores,
        Scene_Scores: Scene_Scores
    };
}());