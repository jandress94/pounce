game.model = (function () {

    let NUM_POUNCE_CARDS = 13;
    let POINTS_TO_WIN = 100;

    let pounce_pile;
    let build_piles;
    let deck;
    let center_piles;
    let ready_for_ditch = false;

    let center_click_metadata;

    let refresh_data;

    const init_module = function () {
        pounce_pile = null;
        build_piles = null;
        deck = null;
        center_piles = null;

        center_click_metadata = null;
        reset_refresh_data();
    };

    const reset_refresh_data = function() {
        refresh_data = {
            refresh_deck_up: false,
            refresh_pounce: false,
            refresh_build_piles: [],
            refresh_center_pile_ids: [],
            refresh_ditch: null
        };
    };

    const start_hand_w_deck = function(d, num_players) {
        pounce_pile = [];
        for (let i = 0; i < NUM_POUNCE_CARDS; i++) {
            pounce_pile.push(d.cards.pop());
        }

        build_piles = [];
        for (let i = 0; i < 4; i++) {
            build_piles.push([d.cards.pop()]);
        }

        deck = [d.cards, []];
        center_piles = [];
        for (let i = 0; i < 4; i++) {
            center_piles.push([]);
            for (let p = 0; p < num_players; p++) {
                center_piles[i].push(0);
            }
        }

        center_click_metadata = null;
        reset_refresh_data();
        ready_for_ditch = false;
    };

    const get_first_pounce_card = function() {
        return pounce_pile.length > 0 ? pounce_pile[0] : null;
    };

    const get_num_pounce_cards_left = function () {
        return pounce_pile.length;
    };

    const cycle_deck = function () {
        if (deck[0].length > 0) {
            let num_to_draw = Math.min(3, deck[0].length);
            for (let i = 0; i < num_to_draw; i++) {
                deck[1].unshift(deck[0].shift());
            }
        } else {
            console.log('resetting deck');
            deck[0] = deck[1];
            deck[0].reverse();
            deck[1] = [];
        }
        refresh_data.refresh_deck_up = true;
    };

    const get_deck_up_cards = function() {
        return deck[1].slice(0, 3);
    };

    const get_build_piles = function() {
        return build_piles;
    };

    const get_center_piles = function() {
        return center_piles;
    };

    const is_valid_build = function(build_pile_idx, move_card, is_pounce_move_card = false) {
        if (build_piles[build_pile_idx].length === 0) {
            return move_card.rank === 13 || is_pounce_move_card;
        } else {
            let build_pile = build_piles[build_pile_idx];
            let build_top_card = build_pile[build_pile.length - 1];

            return build_top_card.suit.color !== move_card.suit.color && build_top_card.rank === move_card.rank + 1;
        }
    };

    const move_to_build_pile = function(move_metadata, build_pile_idx) {
        let move_type = move_metadata.clicked_obj_type;
        if (move_type === 'pounce_pile') {
            if (!is_valid_build(build_pile_idx, pounce_pile[0], true)) {
                return false;
            }

            build_piles[build_pile_idx].push(pounce_pile.shift());
            refresh_data.refresh_pounce = true;
            check_for_win();
        } else if (move_type === 'deck_up_card') {
            if (!is_valid_build(build_pile_idx, deck[1][0])) {
                return false;
            }

            build_piles[build_pile_idx].push(deck[1].shift());
            refresh_data.refresh_deck_up = true;
        } else if (move_type === 'build_pile') {
            let move_build_pile_idx = move_metadata.build_pile_idx;
            let move_build_pile_card_idx = move_metadata.build_pile_card_idx;

            if (!is_valid_build(build_pile_idx, build_piles[move_build_pile_idx][move_build_pile_card_idx])) {
                return false;
            }

            build_piles[build_pile_idx] = build_piles[build_pile_idx].concat(build_piles[move_build_pile_idx].splice(move_build_pile_card_idx, build_piles[move_build_pile_idx].length));
            refresh_data.refresh_build_piles.push(move_build_pile_idx);
        }
        refresh_data.refresh_build_piles.push(build_pile_idx);
        check_reset_ditch();
        return true;
    };

    const check_reset_ditch = function() {
        if (ready_for_ditch) {
            set_ditch(false);
        }
    };

    const check_move_to_center = function(move_metadata, center_pile_coords) {
        let move_type = move_metadata.clicked_obj_type;
        let move_card;
        if (move_type === 'pounce_pile') {
            move_card = pounce_pile[0];
        } else if (move_type === 'deck_up_card') {
            move_card = deck[1][0];
        } else if (move_type === 'build_pile') {
            let move_build_pile_idx = move_metadata.build_pile_idx;
            let move_build_pile_card_idx = move_metadata.build_pile_card_idx;
            if (move_build_pile_card_idx !== build_piles[move_build_pile_idx].length - 1) {
                return false;
            }
            move_card = build_piles[move_build_pile_idx][move_build_pile_card_idx];
        }

        let center_suit = cards.id_to_suit(center_pile_coords[0]);
        let suit_idx = center_pile_coords[0];
        let player_idx = center_pile_coords[1];

        return center_suit.name === move_card.suit.name && center_piles[suit_idx][player_idx] + 1 === move_card.rank;
    };

    const check_for_win = function () {
        if (pounce_pile.length === 0) {
            game.controller.register_pounce();
        }
    };

    const get_num_players = function() {
        return center_piles[0].length;
    };

    const get_refresh_data = function () {
        return refresh_data;
    };

    const set_center_click_metadata = function(center_meta) {
        center_click_metadata = center_meta;
    };

    const process_center_click_metadata = function (accepted) {
        if (accepted) {
            let move_type = center_click_metadata.clicked_obj_type;
            if (move_type === 'pounce_pile') {
                pounce_pile.shift();
                refresh_data.refresh_pounce = true;
                check_for_win();
            } else if (move_type === 'deck_up_card') {
                deck[1].shift();
                refresh_data.refresh_deck_up = true;
            } else if (move_type === 'build_pile') {
                let move_build_pile_idx = center_click_metadata.build_pile_idx;
                build_piles[move_build_pile_idx].pop();
                refresh_data.refresh_build_piles.push(move_build_pile_idx);
            }
            check_reset_ditch();
        }
        center_click_metadata = null;
    };

    const process_update_center = function (new_center_data) {
         let center_pile_coords = new_center_data.center_pile_coords;
         let suit_idx = center_pile_coords[0];
         let player_idx = center_pile_coords[1];
         let new_val = new_center_data.new_val;

         center_piles[suit_idx][player_idx] = Math.max(center_piles[suit_idx][player_idx], new_val);
         refresh_data.refresh_center_pile_ids.push(center_pile_coords);
    };

    const set_ditch = function(val, should_handle_change=true) {
        ready_for_ditch = val;
        refresh_data.refresh_ditch = ready_for_ditch;

        if (should_handle_change) {
            game.controller.handle_ditch_changed(ready_for_ditch);
        }
    };

    const flip_ditch = function() {
        set_ditch(!ready_for_ditch);
    };

    const ditch = function() {
        set_ditch(false, false);

        deck[1].reverse();
        deck[0] = deck[1].concat(deck[0]);
        deck[0].push(deck[0].shift());
        deck[1] = [];

        refresh_data.refresh_deck_up = true;
    };

    return {
        NUM_POINTS_TO_WIN: POINTS_TO_WIN,
        init_module: init_module,
        start_hand_w_deck: start_hand_w_deck,
        get_first_pounce_card: get_first_pounce_card,
        get_num_pounce_cards_left: get_num_pounce_cards_left,
        cycle_deck: cycle_deck,
        get_deck_up_cards: get_deck_up_cards,
        get_build_piles: get_build_piles,
        move_to_build_pile: move_to_build_pile,
        get_center_piles: get_center_piles,
        check_move_to_center: check_move_to_center,
        get_num_players: get_num_players,
        get_refresh_data: get_refresh_data,
        set_center_click_metadata: set_center_click_metadata,
        process_center_click_metadata: process_center_click_metadata,
        process_update_center: process_update_center,
        flip_ditch: flip_ditch,
        ditch: ditch
    };
}());