game.view.phaser = (function () {

    let CARD_SCALE = 0.6;

    let DECK_DOWN_X = 75;
    let DECK_DOWN_Y = 500;

    let DECK_UP_START_X = 175;
    let DECK_UP_DELTA_X = 30;

    let BUILD_PILE_START_X = 400;
    let BUILD_PILE_DELTA_X = 110;
    let BUILD_PILE_START_Y = 350;
    let BUILD_PILE_DELTA_Y = 35;

    let BUILD_BASE_WIDTH = 75;
    let BUILD_BASE_HEIGHT = 100;

    let POUNCE_PILE_X = DECK_UP_START_X;

    let SELECTED_TINT = 0xff9999;

    let phaser_game;

    let refresh_deck_up = false;
    let refresh_pounce = false;
    let refresh_build_piles = [];

    let deck_up_cards_group;
    let build_pile_groups;

    let pounce_pile_top;

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

    const create_pounce_card = function(scene) {
        pounce_pile_top = scene.add.image(POUNCE_PILE_X, BUILD_PILE_START_Y, 'cards', card_to_filename(game.model.get_first_pounce_card()));
        pounce_pile_top.setScale(CARD_SCALE);
        pounce_pile_top.setInteractive();
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
        create_pounce_card(this);

        this.input.on('gameobjectdown', function (pointer, clicked_obj) {
            console.log('click');
            if (clicked_obj === deck_down_card) {
                game.controller.handle_click_hand_draw();
                refresh_deck_up = true;
            } else if (current_click === null) {
                if (build_bases_group.contains(clicked_obj)) {
                    return;
                }

                if (pounce_pile_top === clicked_obj) {
                    console.log('selected pounce pile');
                    current_click = { clicked_obj_type: 'pounce_pile' };
                } else if (deck_up_cards_group.contains(clicked_obj)) {
                    if (!clicked_obj.getData('is_top_up_card')) {
                        return;
                    }
                    console.log('selected face up deck card');
                    current_click = { clicked_obj_type: 'deck_up_card' };
                } else {
                    return;
                }

                clicked_obj.setTint(SELECTED_TINT);
                current_click.clicked_obj = clicked_obj;

            } else if (current_click !== null) {
                for (let i = 0; i < build_pile_groups.length; i++) {
                    if (build_pile_groups[i].contains(clicked_obj)) {
                        if (game.model.move_to_build_pile(current_click.clicked_obj_type, i)) {
                            if (current_click.clicked_obj_type === 'pounce_pile') {
                                refresh_pounce = true
                            } else if (current_click.clicked_obj_type === 'deck_up_card') {
                                refresh_deck_up = true;
                            }
                            refresh_build_piles.push(i);
                        }
                    }
                }

                current_click.clicked_obj.clearTint();
                current_click = null;
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
                deck_up_card.setData('is_top_up_card', i === 0);

                deck_up_cards_group.add(deck_up_card);

                deck_up_card_x += DECK_UP_DELTA_X;
            }
        }

        if (refresh_pounce) {
            refresh_pounce = false;
            pounce_pile_top.destroy();
            create_pounce_card(this);
        }

        if (refresh_build_piles.length > 0) {
            for (let i = refresh_build_piles.length - 1; i >= 0; i--) {
                let build_pile_idx = refresh_build_piles[i];
                build_pile_groups[build_pile_idx].clear(true, true);

                let build_pile_x = BUILD_PILE_START_X + build_pile_idx * BUILD_PILE_DELTA_X;
                let build_pile_y = BUILD_PILE_START_Y;

                let build_pile = game.model.get_build_piles()[build_pile_idx];
                for (let j = 0; j < build_pile.length; j++) {
                    let build_pile_card = this.add.image(build_pile_x, build_pile_y, 'cards', card_to_filename(build_pile[j]));
                    build_pile_card.setScale(CARD_SCALE);
                    build_pile_card.setInteractive();

                    build_pile_groups[build_pile_idx].add(build_pile_card);

                    build_pile_y += BUILD_PILE_DELTA_Y;
                }
                refresh_build_piles.pop();
            }
        }
    };

    const card_to_filename = function(c) {
        return 'card_' + c.suit.name + '_' + c.rank.toString() + '.png';
    };

    return {
        init_module: init_module,
        create_game: create_game
    };
}());