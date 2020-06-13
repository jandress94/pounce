game.view.scene_scores = (function () {

    let SCENE_WIDTH;
    let SCENE_HEIGHT;

    let NAME_X = 150;
    let NAME_DELTA_X = 200;
    let NUMBER_DELTA_X = 120;
    let START_Y = 150;
    let HEADER_DELTA_Y = 100;
    let ROW_DELTA_Y = 50;

    let FONT = { fontFamily: 'Arial', fontSize: 32, color: '#ffffff', align: "center"};

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
            let y = START_Y;

            let graphics = this.add.graphics();

            create_text_row(this, y, ["Player", "Start\nScore", "Center\nCards", "Pounce\nLeft", "End\nScore"]);

            y += HEADER_DELTA_Y;

            let highest_winner = null;
            for (var p in scores_data) {
                if (scores_data.hasOwnProperty(p)) {
                    let scores = scores_data[p];
                    if (scores.end_score >= game.model.NUM_POINTS_TO_WIN && (highest_winner === null || scores.end_score > highest_winner)) {
                        highest_winner = scores.end_score;
                    }
                }
            }

            graphics.fillStyle(0x0000ff);

            for (var p in scores_data) {
                if (scores_data.hasOwnProperty(p)) {
                    let scores = scores_data[p];
                    if (p.length > 12) {
                        p = p.substr(0, 12) + "...";
                    }

                    if (highest_winner !== null && highest_winner === scores.end_score) {
                        graphics.fillRect(0, y - ROW_DELTA_Y / 2, SCENE_WIDTH, ROW_DELTA_Y);
                    }

                    create_text_row(this, y, [
                        p,
                        scores.start_score,
                        scores.num_center,
                        scores.num_pounce_left,
                        scores.end_score
                    ]);

                    y += ROW_DELTA_Y;
                }
            }

            graphics.lineStyle(5, 0xffffff);
            let line_x = NAME_X + NAME_DELTA_X * 0.67;
            let line_y = START_Y + HEADER_DELTA_Y * 0.5;
            graphics.lineBetween(line_x, START_Y - 50, line_x, SCENE_HEIGHT - 50);
            graphics.lineBetween(50, line_y, SCENE_WIDTH - 50, line_y);
        }
    });

    const create_text_row = function(scene, y, texts) {
        scene.add.text(NAME_X, y, texts[0], FONT).setOrigin();
        scene.add.text(NAME_X + NAME_DELTA_X, y, texts[1], FONT).setOrigin();
        scene.add.text(NAME_X + NAME_DELTA_X + NUMBER_DELTA_X, y, texts[2], FONT).setOrigin();
        scene.add.text(NAME_X + NAME_DELTA_X + 2 * NUMBER_DELTA_X, y, texts[3], FONT).setOrigin();
        scene.add.text(NAME_X + NAME_DELTA_X + 3 * NUMBER_DELTA_X, y, texts[4], FONT).setOrigin();
    };

    return {
        init_module: init_module,
        update_scores: update_scores,
        Scene_Scores: Scene_Scores
    };
}());