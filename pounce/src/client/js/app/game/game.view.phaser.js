game.view.phaser = (function () {

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
    };

    const create = function () {
        var card_textures = this.textures.get('cards')

        var frames = card_textures.getFrameNames();

        for (var i = 0; i < frames.length; i++)
        {
            console.log(frames[i]);
            var x = Phaser.Math.Between(0, 800);
            var y = Phaser.Math.Between(0, 600);

            this.add.image(x, y, 'cards', frames[i]);
        }
    };

    return {
        init_module: init_module,
        create_game: create_game
    };
}());