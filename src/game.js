import _ from 'lodash';
import deck from '../assets/deck.json';
import Player from './player';

/**
 * Phases
 * 0 - Waiting for Players to join
 * 1 - Distribute cards to players
 * 2 - Bid
 * 3 - In game
 * 4 - Game end
 */

class Game {
  constructor() {
    this.players = Array(5).fill(null);
    this.phase = 0;

    this.currentRound = [];
    this.largestBid = 0;
    this.calledCard = null;
    this.caller = 0;
    this.playerHands = [];
    this.trump = null;
    this.bid = null;
    this.passedBidPlayers = 0;

    this.init();
  }

  init() {
    const cards = [];
    deck.suits.forEach((suit) => {
      deck.ranks.forEach((rank) => {
        cards.push(_.assign({}, rank, { suit }));
      });
    });
    this.deck = _.shuffle(cards);
  }

  addPlayer(name, id) {
    const emptyIndex = _.findIndex(this.players, null);
    this.players[emptyIndex] = new Player(name, id);
  }

  removePlayer(id) {
    const index = _.findIndex(this.players, { id });
    this.players[index] = null;
  }

  getCards() {
    const cards = this.deck.splice(0, 8);
    this.playerHands.push(cards);
    return cards;
  }

  playCard(cardInfo) {
    this.currentRound.push(cardInfo);
  }

  setCalledCard(player, card) {
    this.calledCard = card;
    this.trump = card.suit;
    this.caller = player;

    for (let i = 0; i < 5; i += 1) {
      if (_.find(this.playerHands[i], { name: card.name, suit: card.suit })) {
        this.guiltyPlayer = i;
      }
    }
  }

  getRoundResult() {
    let largest = this.currentRound.shift();
    let leadingSuit = largest.info.suit;
    let { point } = largest.info;
    const score = Array(5).fill(0);

    this.currentRound.forEach((card) => {
      const cardValue = card.info.value;
      const cardSuit = card.info.suit;
      const { trump } = this;
      const largestValue = largest.info.value;
      const largestTrump = largest.info.trump;

      /**
       * Largest card should be replaced in the following cases:
       * - Current card has the leading suit and largest card is not trump;
       *   and current card has larger value
       * - Current card is trump and largest card is not trump
       * - Current card is trump and largest card is trump; current card has larger value
       */
      if ((cardSuit === leadingSuit && largestTrump !== trump)
        || (cardSuit === trump && largestTrump === trump)) {
        if (cardValue > largestValue) {
          largest = card;
        }
      } else if (cardSuit === trump && largestTrump !== trump) {
        largest = card;
        leadingSuit = trump;
      }
      point += card.info.point;
    });

    score[largest.player - 1] += point;
    this.currentRound = [];
    return largest;
  }

  _updateScore(score) {
    for (let i = 0; i < 5; i += 1) {
      this.players[i].score += score[i];
    }
  }

  submitBid(bid) {
    if (!this.bid || bid.amount > this.bid.amount) {
      this.bid = bid;
    }
  }

  submitBidPass() {
    this.passedBidPlayers += 1;
  }

  getScores() {
    return this.scores;
  }
}

module.exports = Game;
