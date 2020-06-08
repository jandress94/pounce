game.view.phaser = (function () {

    let CARD_SCALE = 0.6;

    let DECK_DOWN_X = 75;
    let DECK_DOWN_Y = 500;

    let DECK_UP_START_X = 175;
    let DECK_UP_DELTA_X = 30;

    let BUILD_PILE_START_X = 400;
    let BUILD_PILE_DELTA_X = 110;
    let BUILD_PILE_START_Y = 350;
    let BUILD_PILE_DELTA_Y = 40;

    let BUILD_BASE_WIDTH = 75;
    let BUILD_BASE_HEIGHT = 100;

    let POUNCE_PILE_X = DECK_UP_START_X;

    let SELECTED_TINT = 0xff9999;

    let phaser_game;

    let refresh_deck_up = false;

    let deck_up_cards_group;
    let build_pile_groups;

    let current_click;

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
                update: update
            }
        };

        phaser_game = new Phaser.Game(config);
    };

    const preload = function () {
        this.load.atlasXML('cards', '/assets/imgs/playingCards.png', '/assets/imgs/playingCards.xml');
        this.load.atlasXML('card_backs', '/assets/imgs/playingCardBacks.png', '/assets/imgs/playingCardBacks.xml')
    };

    const create = function () {
        current_click = null;

        // create face down card for the deck
        let deck_down_card = this.add.image(DECK_DOWN_X, DECK_DOWN_Y, 'card_backs', 'cardBack_red5.png');
        deck_down_card.setScale(CARD_SCALE);
        deck_down_card.setInteractive();

        // create group to hold face up deck cards
        deck_up_cards_group = this.add.group();

        // create build piles groups
        build_pile_groups = [];
        let build_bases_group = this.add.group();

        // create texture for the base of the build piles
        let graphics = this.add.graphics().fillStyle(0x0000ff).fillRect(0, 0, BUILD_BASE_WIDTH, BUILD_BASE_HEIGHT);
        graphics.generateTexture('build_base', BUILD_BASE_WIDTH, BUILD_BASE_HEIGHT);
        graphics.destroy();

        // create the build piles with a base and starting card
        let build_pile_x = BUILD_PILE_START_X;
        for (let i = 0; i < game.model.get_build_piles().length; i++) {
            let build_base = this.add.image(build_pile_x, BUILD_PILE_START_Y, 'build_base');
            build_base.setInteractive();

            build_pile_groups.push(this.add.group());
            build_pile_groups[i].add(build_base);
            build_bases_group.add(build_base);

            let build_pile_card = this.add.image(build_pile_x, BUILD_PILE_START_Y, 'cards', card_to_filename(game.model.get_build_piles()[i][0]));
            build_pile_card.setScale(CARD_SCALE);
            build_pile_card.setInteractive();
            build_pile_groups[i].add(build_pile_card);

            build_pile_x += BUILD_PILE_DELTA_X;
        }

        // create pounce pile
        let pounce_pile_top = this.add.image(POUNCE_PILE_X, BUILD_PILE_START_Y, 'cards', card_to_filename(game.model.get_first_pounce_card()));
        pounce_pile_top.setScale(CARD_SCALE);
        pounce_pile_top.setInteractive();

        this.input.on('gameobjectdown', function (pointer, gameObject) {
            console.log('click');
            if (gameObject === deck_down_card) {
                game.controller.handle_click_hand_draw();
                refresh_deck_up = true;
            } else if (current_click === null && !build_bases_group.contains(gameObject)) {
                gameObject.setTint(SELECTED_TINT);
                current_click = {
                    clicked_obj: gameObject
                };

                if (pounce_pile_top === gameObject) {
                    console.log('selected pounce pile');
                } else if (deck_up_cards_group.contains(gameObject)) {
                    console.log('selected face up deck card');
                }
            }
        });
    };

    const update = function () {
        if (refresh_deck_up) {
            refresh_deck_up = false;
            let deck_up_cards = game.model.get_deck_up_cards();
            deck_up_cards_group.clear(true, true);

            let deck_up_card_x = DECK_UP_START_X;
            for (let i = deck_up_cards.length - 1; i >= 0; i--) {
                let deck_up_card = this.add.image(deck_up_card_x, DECK_DOWN_Y, 'cards', card_to_filename(deck_up_cards[i]));
                deck_up_card.setScale(CARD_SCALE);
                deck_up_card.setInteractive();

                deck_up_cards_group.add(deck_up_card);

                deck_up_card_x += DECK_UP_DELTA_X;
            }
        }
    };

    const card_to_filename = function(c) {
        return 'card_' + c.suit + '_' + c.rank.toString() + '.png';
    };

    return {
        init_module: init_module,
        create_game: create_game
    };
}());