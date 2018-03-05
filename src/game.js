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
    this.deck = _.shuffle(deck);

    this.playerOrder.forEach(() => {
      this.players.push({
        score: 0,
        cards: null,
        occupied: false,
        ready: false,
        passed: false,
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

  addPlayer(name) {
    const emptyIndex = _.findIndex(this.players, { occupied: false });
    this.players[emptyIndex].occupied = true;
    this.players[emptyIndex].name = name;
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

  setReadyStatus(index, status) {
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
    let leadingSuit = largest.suit;
    let point = largest.rank.point;
    const score = Array(5).fill(0);

    this.currentRound.forEach((card) => {
      const cardValue = card.rank.value;
      const cardSuit = card.suit;
      const { trump } = this;
      const largestValue = largest.rank.value;
      const largestTrump = largest.trump;

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
      point += card.rank.point;
    });

    score[largest.playerIndex] += point;
    this._updateScore(score);
    this.currentRound = [];
    return largest;
  }

  submitBid(bid, index) {
    if (bid.passed) {
      this.passedBidPlayers += 1;
      this.players[index].passed = true;
    } else {
      this.bid = Math.max(bid.points, this.bid);
    }
  }

  getBid() {
    return this.bid;
  }

  getScores() {
    return this.players.map(player => player.score);
  }

  getCaller() {
    if (this.passedBidPlayers === 4) {
      const index = _.findIndex(this.players, { passed: false });
      if (index > -1) {
        return { name: this.players[index].name, index };
      }
    }
    return null;
  }

  isGameOver() {
    return this.roundCount === 5;
  }

  getFinalResult() {
    const scores = this.getScores();
    const callerPoints = scores.splice(this.caller, 1)[0];
    const guiltyPlayerPoints = scores.splice(this.guiltyPlayer, 1)[0];
    const nonGuiltyPoints = scores.reduce((a, b) => a + b, 0);
    return {
      guiltyPoints: callerPoints + guiltyPlayerPoints,
      nonGuiltyPoints,
      bid: this.bid,
    };
  }
}

module.exports = Game;
