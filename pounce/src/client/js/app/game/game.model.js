game.model = (function () {

    let NUM_POUNCE_CARDS = 2;

    let pounce_pile;
    let build_piles;
    let deck;
    let center_piles;

    const init_module = function () {
        pounce_pile = null;
        build_piles = null;
        deck = null;
        center_piles = null;
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
    };

    const get_first_pounce_card = function() {
        return pounce_pile.length > 0 ? pounce_pile[0] : null;
    };

    const is_deck_empty = function () {
        return deck[0].length === 0;
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
        } else if (move_type === 'deck_up_card') {
            if (!is_valid_build(build_pile_idx, deck[1][0])) {
                return false;
            }

            build_piles[build_pile_idx].push(deck[1].shift());
        } else if (move_type === 'build_pile') {
            let move_build_pile_idx = move_metadata.build_pile_idx;
            let move_build_pile_card_idx = move_metadata.build_pile_card_idx;

            if (!is_valid_build(build_pile_idx, build_piles[move_build_pile_idx][move_build_pile_card_idx])) {
                return false;
            }

            build_piles[build_pile_idx] = build_piles[build_pile_idx].concat(build_piles[move_build_pile_idx].splice(move_build_pile_card_idx, build_piles[move_build_pile_idx].length));
        }
        return true;
    };
    
    const is_valid_center = function (center_pile_coords, move_card) {
        console.log(center_pile_coords, move_card);
        let center_suit = cards.id_to_suit(center_pile_coords[0]);
        let center_idx = center_pile_coords[1];

        return center_suit.name === move_card.suit.name && center_piles[center_pile_coords[0]][center_pile_coords[1]] + 1 === move_card.rank;
    };

    const move_to_center_pile = function(move_metadata, center_pile_coords) {
        let move_type = move_metadata.clicked_obj_type;
        if (move_type === 'pounce_pile') {
            if (!is_valid_center(center_pile_coords, pounce_pile[0])) {
                return false;
            }

            pounce_pile.shift();
        } else if (move_type === 'deck_up_card') {
            if (!is_valid_center(center_pile_coords, deck[1][0])) {
                return false;
            }

            deck[1].shift();
        } else if (move_type === 'build_pile') {
            let move_build_pile_idx = move_metadata.build_pile_idx;
            let move_build_pile_card_idx = move_metadata.build_pile_card_idx;

            if (move_build_pile_card_idx !== build_piles[move_build_pile_idx].length - 1 ||
                !is_valid_center(center_pile_coords, build_piles[move_build_pile_idx][move_build_pile_card_idx])) {
                return false;
            }

            build_piles[move_build_pile_idx].pop();
        }

        center_piles[center_pile_coords[0]][center_pile_coords[1]] += 1;
        return true;
    };

    const get_num_players = function() {
        return center_piles[0].length;
    };

    return {
        init_module: init_module,
        start_hand_w_deck: start_hand_w_deck,
        get_first_pounce_card: get_first_pounce_card,
        is_deck_empty: is_deck_empty,
        cycle_deck: cycle_deck,
        get_deck_up_cards: get_deck_up_cards,
        get_build_piles: get_build_piles,
        move_to_build_pile: move_to_build_pile,
        get_center_piles: get_center_piles,
        move_to_center_pile: move_to_center_pile,
        get_num_players: get_num_players
    };
}());