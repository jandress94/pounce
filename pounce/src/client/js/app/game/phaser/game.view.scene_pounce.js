game.view.scene_pounce = (function () {

    let SCENE_WIDTH;
    let SCENE_HEIGHT;

    let CARD_WIDTH = 80;
    let CARD_HEIGHT = 115;

    let DECK_DOWN_IMG = 'cardBack_red5.png';
    let DECK_DOWN_X = 75;
    let DECK_DOWN_Y = 500;

    let DECK_UP_START_X = 175;
    let DECK_UP_DELTA_X = 30;

    let BUILD_PILE_START_X = 400;
    let BUILD_PILE_DELTA_X = 110;
    let BUILD_PILE_START_Y = 350;
    let BUILD_PILE_DELTA_Y = 35;

    let BUILD_PILE_MAX_BEFORE_SHRINK = 8;
    let MAX_BUILD_HEIGHT = CARD_HEIGHT + (BUILD_PILE_MAX_BEFORE_SHRINK - 1) * BUILD_PILE_DELTA_Y;

    let BUILD_BASE_WIDTH = 75;
    let BUILD_BASE_HEIGHT = 100;

    let POUNCE_PILE_X = DECK_UP_START_X;
    let POUNCE_PILE_DELTA = 5;

    let CENTER_PILE_START_Y = 50;
    let CENTER_PILE_GAP_Y = 20;
    let CENTER_PILE_GAP_X = 20;
    let CENTER_PILE_CARD_WIDTH = 100;
    let CENTER_PILE_CARD_HEIGHT = 40;

    let CENTER_PILE_FONT = 'Arial';
    let CENTER_PILE_TEXT_SIZE = 50;

    let ditch_button;
    let DITCH_BUTTON_X = DECK_DOWN_X;
    let DITCH_BUTTON_Y =  BUILD_PILE_START_Y;
    let DITCH_BUTTON_WIDTH = 75;
    let DITCH_BUTTON_HEIGHT = 25;
    let DITCH_BUTTON_FONT_SIZE = 24;
    let DITCH_UNSELECTED_TINT = 0xff0000;
    let DITCH_SELECTED_TINT = 0x00ff00;

    let SELECTED_TINT = 0xff9999;

    let deck_up_cards_group;
    let build_pile_groups;

    let pounce_pile_top;
    let pounce_pile_down_cards;

    let current_click;

    let center_texts;

    const init_module = function(w, h) {
        SCENE_WIDTH = w;
        SCENE_HEIGHT = h;
    };

    let Scene_Pounce = new Phaser.Class({
        Extends: Phaser.Scene,

        initialize: function Scene_Pounce () {
            Phaser.Scene.call(this, {key: 'scene_pounce'});
        },

        preload: function () {
            this.load.atlasXML('cards', '/assets/imgs/playingCards.png', '/assets/imgs/playingCards.xml');
            this.load.atlasXML('card_backs', '/assets/imgs/playingCardBacks.png', '/assets/imgs/playingCardBacks.xml')

            // create texture for the base of the build piles
            let graphics = this.add.graphics().fillStyle(0xffffff).fillRect(0, 0, BUILD_BASE_WIDTH, BUILD_BASE_HEIGHT);
            graphics.generateTexture('build_base', BUILD_BASE_WIDTH, BUILD_BASE_HEIGHT);
            graphics.destroy();
        },

        create: function () {
            current_click = null;

            // create face down card for the deck
            let deck_down_card = this.add.image(DECK_DOWN_X, DECK_DOWN_Y, 'card_backs', DECK_DOWN_IMG);
            deck_down_card.setScale(CARD_WIDTH / deck_down_card.width, CARD_HEIGHT / deck_down_card.height);
            deck_down_card.setInteractive();

            // create group to hold face up deck cards
            deck_up_cards_group = this.add.group();

            // create build piles groups
            build_pile_groups = [];
            let build_bases_group = this.add.group();

            // create the build piles with a base and starting card
            let build_pile_x = BUILD_PILE_START_X;
            for (let i = 0; i < game.model.get_build_piles().length; i++) {
                let build_base = this.add.image(build_pile_x, BUILD_PILE_START_Y, 'build_base');
                build_base.setInteractive();
                build_base.setData('build_pile_idx', i);

                build_pile_groups.push(this.add.group());
                build_bases_group.add(build_base);

                let build_pile_card = this.add.image(build_pile_x, BUILD_PILE_START_Y, 'cards', card_to_filename(game.model.get_build_piles()[i][0]));
                build_pile_card.setScale(CARD_WIDTH / build_pile_card.width, CARD_HEIGHT / build_pile_card.height);
                build_pile_card.setInteractive();
                build_pile_card.setData('build_pile_idx', i);
                build_pile_card.setData('build_pile_card_idx', 0);
                build_pile_groups[i].add(build_pile_card);

                build_pile_x += BUILD_PILE_DELTA_X;
            }

            // create pounce pile
            pounce_pile_down_cards = null;
            create_pounce_card(this);

            // create center piles
            center_texts = [];
            let center_piles = game.model.get_center_piles();
            for (let s = 0; s < center_piles.length; s++) {
                center_texts.push([]);
                for (let p = 0; p < game.model.get_num_players(); p++) {
                    let center_pile_coords = center_pile_ids_to_loc(s, p);
                    let center_pile_x = center_pile_coords[0];
                    let center_pile_y = center_pile_coords[1];

                    let center_pile_base = this.add.image(center_pile_x, center_pile_y, 'build_base');
                    center_pile_base.setScale(CENTER_PILE_CARD_WIDTH / center_pile_base.width, CENTER_PILE_CARD_HEIGHT / center_pile_base.height);
                    center_pile_base.setInteractive();
                    center_pile_base.setData('center_pile_coords', [s, p]);

                    let text = create_center_card_text(this, center_pile_x, center_pile_y, cards.id_to_suit(s));
                    center_texts[s].push(text);
                }
            }

            // create ditch button
            ditch_button = this.add.image(DITCH_BUTTON_X, DITCH_BUTTON_Y, 'build_base');
            ditch_button.setScale(DITCH_BUTTON_WIDTH / ditch_button.width, DITCH_BUTTON_HEIGHT / ditch_button.height);
            ditch_button.setInteractive();
            ditch_button.setTint(DITCH_UNSELECTED_TINT);
            this.add.text(DITCH_BUTTON_X, DITCH_BUTTON_Y, "Ditch", { fontFamily: CENTER_PILE_FONT, fontSize: DITCH_BUTTON_FONT_SIZE, color: '#000000' }).setOrigin();

            this.input.on('gameobjectdown', function (pointer, clicked_obj) {
                if (clicked_obj === deck_down_card) {
                    game.controller.handle_click_hand_draw();
                    clean_current_click();
                } else if (clicked_obj === ditch_button) {
                    game.controller.handle_ditch_button_clicked();
                } else if (current_click === null) {
                    if (build_bases_group.contains(clicked_obj)) {
                        return;
                    }

                    if (pounce_pile_top === clicked_obj) {
                        console.log('selected pounce pile');
                        current_click = {click_metadata: { clicked_obj_type: 'pounce_pile' }};
                    } else if (deck_up_cards_group.contains(clicked_obj)) {
                        if (!clicked_obj.getData('is_top_up_card')) {
                            return;
                        }
                        console.log('selected face up deck card');
                        current_click = {click_metadata: { clicked_obj_type: 'deck_up_card' }};
                    } else if (clicked_obj.getData('build_pile_card_idx') !== undefined) {
                        current_click = {click_metadata: {
                            clicked_obj_type: 'build_pile',
                                build_pile_idx: clicked_obj.getData('build_pile_idx'),
                                build_pile_card_idx: clicked_obj.getData('build_pile_card_idx')
                        }};
                    } else {
                        return;
                    }

                    clicked_obj.setTint(SELECTED_TINT);
                    current_click.clicked_obj = clicked_obj;

                } else if (current_click !== null) {
                    let build_pile_idx = clicked_obj.getData('build_pile_idx');
                    let center_pile_coords = clicked_obj.getData('center_pile_coords');
                    console.log(center_pile_coords);

                    if (build_pile_idx !== undefined) {
                        game.controller.handle_move_to_build_pile(current_click.click_metadata, build_pile_idx);
                    } else if (center_pile_coords !== undefined) {
                        game.controller.handle_move_to_center_pile(current_click.click_metadata, center_pile_coords);
                    }

                    clean_current_click();
                }
            });
        },

        update: function () {
            let refresh_data = game.model.get_refresh_data();

            if (refresh_data.refresh_deck_up) {
                refresh_data.refresh_deck_up = false;
                let deck_up_cards = game.model.get_deck_up_cards();
                deck_up_cards_group.clear(true, true);

                let deck_up_card_x = DECK_UP_START_X;
                for (let i = deck_up_cards.length - 1; i >= 0; i--) {
                    let deck_up_card = this.add.image(deck_up_card_x, DECK_DOWN_Y, 'cards', card_to_filename(deck_up_cards[i]));
                    deck_up_card.setScale(CARD_WIDTH / deck_up_card.width, CARD_HEIGHT / deck_up_card.height);
                    deck_up_card.setInteractive();
                    deck_up_card.setData('is_top_up_card', i === 0);

                    deck_up_cards_group.add(deck_up_card);

                    deck_up_card_x += DECK_UP_DELTA_X;
                }
            }

            if (refresh_data.refresh_pounce) {
                refresh_data.refresh_pounce = false;
                pounce_pile_top.destroy();
                create_pounce_card(this);
            }

            if (refresh_data.refresh_build_piles.length > 0) {
                for (let i = refresh_data.refresh_build_piles.length - 1; i >= 0; i--) {
                    let build_pile_idx = refresh_data.refresh_build_piles[i];
                    build_pile_groups[build_pile_idx].clear(true, true);

                    let build_pile = game.model.get_build_piles()[build_pile_idx];
                    let num_cards = build_pile.length;

                    let build_pile_x = BUILD_PILE_START_X + build_pile_idx * BUILD_PILE_DELTA_X;
                    let build_pile_y = BUILD_PILE_START_Y;
                    let card_height = CARD_HEIGHT;
                    let delta_y = BUILD_PILE_DELTA_Y;

                    if (num_cards > BUILD_PILE_MAX_BEFORE_SHRINK) {
                        let height_scale = MAX_BUILD_HEIGHT / (CARD_HEIGHT + (num_cards - 1) * BUILD_PILE_DELTA_Y);

                        build_pile_y -= card_height * (1 - height_scale) / 2;
                        card_height *= height_scale;
                        delta_y *= height_scale;
                    }

                    for (let j = 0; j < num_cards; j++) {
                        let build_pile_card = this.add.image(build_pile_x, build_pile_y, 'cards', card_to_filename(build_pile[j]));
                        build_pile_card.setScale(CARD_WIDTH / build_pile_card.width, card_height / build_pile_card.height);
                        console.log(build_pile_card.displayWidth, build_pile_card.displayHeight);
                        build_pile_card.setInteractive();
                        build_pile_card.setData('build_pile_idx', build_pile_idx);
                        build_pile_card.setData('build_pile_card_idx', j);

                        build_pile_groups[build_pile_idx].add(build_pile_card);

                        build_pile_y += delta_y;
                    }
                    refresh_data.refresh_build_piles.pop();
                }
            }

            if (refresh_data.refresh_center_pile_ids.length > 0) {
                for (let i = refresh_data.refresh_center_pile_ids.length - 1; i >= 0; i--) {
                    let center_coords = refresh_data.refresh_center_pile_ids[i];
                    let center_coord_s = center_coords[0];
                    let center_coord_p = center_coords[1];

                    let center_pile_coords = center_pile_ids_to_loc(center_coord_s, center_coord_p);
                    let center_pile_x = center_pile_coords[0];
                    let center_pile_y = center_pile_coords[1];

                    center_texts[center_coord_s][center_coord_p].destroy();
                    center_texts[center_coord_s][center_coord_p] = create_center_card_text(this,
                        center_pile_x,
                        center_pile_y,
                        cards.id_to_suit(center_coord_s),
                        game.model.get_center_piles()[center_coord_s][center_coord_p]
                    );
                    refresh_data.refresh_center_pile_ids.pop();
                }
            }

            if (refresh_data.refresh_ditch !== null) {
                if (refresh_data.refresh_ditch) {
                    ditch_button.setTint(DITCH_SELECTED_TINT);
                } else {
                    ditch_button.setTint(DITCH_UNSELECTED_TINT);
                }
                refresh_data.refresh_ditch = null;
            }
        }
    });

    const create_pounce_card = function(scene) {
        let pounce_card = game.model.get_first_pounce_card();
        if (pounce_card === null) {
            return;
        }

        let num_pounce_cards = game.model.get_num_pounce_cards_left();

        if (pounce_pile_down_cards === null) {
            pounce_pile_down_cards = [];
            for (let i = num_pounce_cards - 1; i > 0; i--) {
                let pounce_pile_down = scene.add.image(POUNCE_PILE_X + i * POUNCE_PILE_DELTA,
                    BUILD_PILE_START_Y, 'card_backs', DECK_DOWN_IMG);
                pounce_pile_down.setScale(CARD_WIDTH / pounce_pile_down.width, CARD_HEIGHT / pounce_pile_down.height);
                pounce_pile_down_cards.unshift(pounce_pile_down);
            }
        }

        while (pounce_pile_down_cards.length > num_pounce_cards - 1) {
            let c = pounce_pile_down_cards.pop();
            c.destroy();
        }

        pounce_pile_top = scene.add.image(POUNCE_PILE_X, BUILD_PILE_START_Y, 'cards', card_to_filename(pounce_card));
        pounce_pile_top.setScale(CARD_WIDTH / pounce_pile_top.width, CARD_HEIGHT / pounce_pile_top.height);
        pounce_pile_top.setInteractive();
    };

    const create_center_card_text = function(scene, x, y, s, r=null) {
        let text = "";
        if (r !== null) {
            if (r === 1) {
                text += "A";
            } else if (r === 11) {
                text += "J";
            } else if (r === 12) {
                text += "Q";
            } else if (r === 13) {
                text += "K";
            } else {
                text += r.toString();
            }
        }

        if (s === cards.Suits.CLUB) {
            text += "♣️";
        } else if (s === cards.Suits.DIAMOND) {
            text += "♦️";
        } else if (s === cards.Suits.HEART) {
            text += "♥️️";
        } else if (s === cards.Suits.SPADE) {
            text += "♠️️";
        }

        let color = (s === cards.Suits.DIAMOND || s === cards.Suits.HEART) ? '#ff0000' : '#000000';

        return scene.add.text(x, y, text, { fontFamily: CENTER_PILE_FONT, fontSize: CENTER_PILE_TEXT_SIZE, color: color }).setOrigin();
    };

    const center_pile_ids_to_loc = function(s, p) {
        return [
            (SCENE_WIDTH - (game.model.get_num_players() - 1) * (CENTER_PILE_CARD_WIDTH + CENTER_PILE_GAP_X)) / 2 + p * (CENTER_PILE_CARD_WIDTH + CENTER_PILE_GAP_X),
            CENTER_PILE_START_Y + s * (CENTER_PILE_CARD_HEIGHT + CENTER_PILE_GAP_Y)
        ];
    };

    const clean_current_click = function () {
        if (current_click !== null) {
            current_click.clicked_obj.clearTint();
            current_click = null;
        }
    };

    const card_to_filename = function(c) {
        return 'card_' + c.suit.name + '_' + c.rank.toString() + '.png';
    };

    return {
        init_module: init_module,
        Scene_Pounce: Scene_Pounce
    };
}());