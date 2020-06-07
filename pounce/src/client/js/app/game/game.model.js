game.model = (function () {

    let pounce_pile;
    let build_piles;
    let hand;
    let center_piles;

    const init_module = function () {
        pounce_pile = null;
        build_piles = null;
        hand = null;
        center_piles = null;
    };

    const start_hand_w_deck = function(deck) {
        pounce_pile = [];
        for (let i = 0; i < 13; i++) {
            pounce_pile.push(deck.cards.pop());
        }

        build_piles = [];
        for (let i = 0; i < 4; i++) {
            build_piles.push([deck.cards.pop()]);
        }

        hand = deck.cards;
    };

    const get_first_pounce_card = function() {
        return pounce_pile[0];
    };

    return {
        init_module: init_module,
        start_hand_w_deck: start_hand_w_deck,
        get_first_pounce_card: get_first_pounce_card
    };
}());