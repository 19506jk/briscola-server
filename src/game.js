import _ from 'lodash';
import deck from '../assets/deck.json';

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
    this.players = [];
    this.phase = 0;

    this.roundCount = 0;
    this.currentRound = [];
    this.largestBid = 0;
    this.calledCard = null;
    this.caller = -1;
    this.guiltyPlayer = -1;
    this.trump = null;
    this.bid = 0;
    this.passedBidPlayers = 0;
    this.playerOrder = [0, 1, 2, 3, 4];

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

    this.playerOrder.forEach(() => {
      this.players.push({
        score: 0,
        cards: null,
        occupied: false,
        ready: false
      });
    });
  }

  _rotateOrder(pos) {
    const arr = [0, 1, 2, 3, 4];
    const removed = arr.splice(0, pos);
    this.playerOrder = arr.concat(removed);
  }

  _updateScore(score) {
    for (let i = 0; i < 5; i += 1) {
      this.players[i].score += score[i];
    }
  }

  addPlayer() {
    const emptyIndex = _.findIndex(this.players, { occupied: false });
    this.players[emptyIndex].occupied = true;
    return emptyIndex;
  }

  removePlayer(index) {
    this.players[index].occupied = false;
  }

  getCards(index) {
    const cards = this.deck.splice(0, 8);
    this.players[index].cards = cards;
    if (_.find(cards, { suit: 'Feathers', rank: { name: 'Two' } })) {
      this._rotateOrder(index);
    }
    return cards;
  }

  playCard(cardInfo) {
    this.currentRound.push(cardInfo);
  }

  setReadyStatus(status, index) {
    this.players[index].ready = status;
  }

  playersReady() {
    return _.findIndex(this.players, { ready: false }) === -1;
  }

  setCalledCard(player, card) {
    this.calledCard = card;
    this.trump = card.suit;
    this.caller = player;

    for (let i = 0; i < 5; i += 1) {
      if (_.find(this.players[i].cards, { suit: card.suit, rank: { name: card.name } })) {
        this.guiltyPlayer = i;
      }
    }
  }

  getNextPlayer() {
    if (this.playerOrder.length > 0) {
      return this.playerOrder.shift();
    }
    return -1;
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

    score[largest.player] += point;
    this._updateScore(score);
    this.currentRound = [];
    return largest;
  }

  submitBid(bid) {
    this.bid = Math.max(bid, this.bid);
  }

  submitBidPass(index) {
    this.passedBidPlayers += 1;
    this.players[index].passed = true;
    if (this.passedBidPlayers === 4) {
      return _.findIndex(this.players, { passed: false });
    }
    return -1;
  }

  getBid() {
    return this.bid;
  }

  getScores() {
    return this.players.map(player => player.score);
  }

  isGameOver() {
    return this.roundCount === 5;
  }

  getFinalResult() {
    const callerPoints = this.scores.splice(this.caller, 1);
    const guiltyPoints = this.scores.splice(this.guiltyPlayer, 1) + callerPoints;
    const noneGuiltyPoints = this.scores.reduce((a, b) => a + b, 0);
    return {
      guiltyPoints,
      noneGuiltyPoints,
      bid: this.bid
    }
  }
}

module.exports = Game;
