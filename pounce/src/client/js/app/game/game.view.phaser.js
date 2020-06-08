game.view.phaser = (function () {

    let CARD_SCALE = 0.6;
    let HAND_DRAW_X = 100;
    let HAND_DRAW_Y = 500;

    let phaser_game;

    const init_module = function () {
        phaser_game = null
    };

    const create_game = function (game_div) {
        var config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent: game_div,
            scene: {
                preload: preload,
                create: create,
                // update: update
            }
        };

        phaser_game = new Phaser.Game(config);
    };

    const preload = function () {
        this.load.atlasXML('cards', '/assets/imgs/playingCards.png', '/assets/imgs/playingCards.xml');
        this.load.atlasXML('card_backs', '/assets/imgs/playingCardBacks.png', '/assets/imgs/playingCardBacks.xml')
    };

    const create = function () {
        var card_textures = this.textures.get('cards');
        var card_back_textures = this.textures.get('card_backs');

        let hand_draw_pile = this.add.image(HAND_DRAW_X, HAND_DRAW_Y, 'card_backs', 'cardBack_red5.png');
        hand_draw_pile.setScale(CARD_SCALE);
        hand_draw_pile.setInteractive();


        // var frames = card_textures.getFrameNames();
        //
        // for (var i = 0; i < frames.length; i++)
        // {
        //     var x = Phaser.Math.Between(0, 800);
        //     var y = Phaser.Math.Between(0, 600);
        //
        //     let card_sprite = this.add.image(x, y, 'cards', frames[i]);
        //     card_sprite.setInteractive();
        //     this.input.setDraggable(card_sprite);
        // }
        //
        // this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
        //     gameObject.x = dragX;
        //     gameObject.y = dragY;
        // });

        this.input.on('gameobjectdown', function (pointer, gameObject) {
            console.log('click');
            if (gameObject === hand_draw_pile) {
                console.log('click cycle deck');
                game.controller.handle_click_hand_draw();
            }
        });
    };

    return {
        init_module: init_module,
        create_game: create_game
    };
}());