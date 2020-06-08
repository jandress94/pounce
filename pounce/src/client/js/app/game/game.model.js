game.model = (function () {

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

    const start_hand_w_deck = function(d) {
        pounce_pile = [];
        for (let i = 0; i < 13; i++) {
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

    return {
        init_module: init_module,
        start_hand_w_deck: start_hand_w_deck,
        get_first_pounce_card: get_first_pounce_card,
        is_deck_empty: is_deck_empty,
        cycle_deck: cycle_deck,
        get_deck_up_cards: get_deck_up_cards,
        get_build_piles: get_build_piles
    };
}());