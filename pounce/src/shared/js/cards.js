(function(exports){

    var Suits = Object.freeze({CLUB: 'CLUB', DIAMOND: 'DIAMOND', HEART: 'HEART', SPADE: 'SPADE'});

    var Card = class Card {
        constructor(suit, rank) {
            this.suit = suit;
            this.rank = rank;
        }

        get_suit() {
            return this.suit;
        }

        get_rank() {
            return this.rank;
        }
    };

    var Deck = class Deck {
        constructor() {
            this.cards = [];
            for (var s in Suits) {
                if (Suits.hasOwnProperty(s)) {
                    for (let r = 1; r <= 13; r++) {
                        this.cards.push(new Card(s, r));
                    }
                }
            }
        }

        draw() {
            return this.cards.shift();
        }
    };

    var Player = class Player {
        constructor() {
            this.name = null;
            this.deck = null;
            this.pounce_pile = null;
            this.build_piles = null;
        }

        set_name(name) {
            this.name = name;
        }

        get_name() {
            return this.name;
        }

        get_deck() {
            return this.deck;
        }

        get_pounce_pile() {
            return this.pounce_pile;
        }

        get_build_piles() {
            return this.build_piles;
        }

        setup_new_round(deck) {
            this.pounce_pile = [];
            for (let i = 0; i < 13; i++) {
                this.pounce_pile.push(deck.draw());
            }
            this.build_piles = [];
            for (let i = 0; i < 4; i++) {
                this.build_piles.push([deck.draw()]);
            }
            this.deck = deck
        }
    };

    exports.Suits = Suits;
    exports.Card = Card;
    exports.Deck = Deck;
    exports.Player = Player;

}(typeof exports === 'undefined' ? this.cards = {} : exports));




