import { assert } from 'chai';
import _ from 'lodash';
import Game from '../src/game';
import Deck from '../assets/deck.json';

const createPlayedCard = (playerIndex, playerName, cardSuit, cardName) => {
  const card = _.find(Deck, { name: cardName, suit: cardSuit });
  return _.merge(card, { playerIndex, playerName });
};

describe('Game', () => {
  let game;

  const playSet = () => {
    game.playCard(createPlayedCard(0, 'Player 0', 'Sun', 'Two'));
    game.playCard(createPlayedCard(1, 'Player 1', 'Feather', 'Two'));
    game.playCard(createPlayedCard(2, 'Player 2', 'Cup', 'King'));
    game.playCard(createPlayedCard(3, 'Player 3', 'Sword', 'Four'));
    game.playCard(createPlayedCard(4, 'Player 4', 'Sun', 'King'));
  };

  beforeEach(() => {
    game = new Game();
  });

  describe('#constructor', () => {
    it('should initialize the game correctly', () => {
      assert.equal(game.deck.length, 40, 'the deck is set');
      assert.equal(game.players.length, 5, 'players array is set');
      assert.deepEqual(game.players[0], {
        score: 0,
        cards: null,
        occupied: false,
        ready: false,
        passed: false,
      }, 'player object is set correctly');
    });
  });

  describe('#_rotateOrder', () => {
    it('should rotate array correctly', () => {
      game._rotateOrder(2);
      assert.deepEqual(game.playerOrder, [2, 3, 4, 0, 1]);
    });
  });

  describe('#_updateScore', () => {
    it('should update player scores with the given array', () => {
      const arr = [1, 2, 3, 4, 5];
      game._updateScore(arr);
      assert.deepEqual(game.getScores(), arr);
    });
  });

  describe('#addPlayer', () => {
    it('should return the index of new player', () => {
      const firstPlayerIndex = game.addPlayer();
      const secondPlayerIndex = game.addPlayer();
      assert.equal(firstPlayerIndex, 0);
      assert.equal(secondPlayerIndex, 1);
    });

    it('should return correct index after a player is removed', () => {
      game.addPlayer();
      game.addPlayer();
      game.removePlayer(0);
      assert.equal(game.addPlayer(), 0, 'new player is given the correct index');
    });
  });

  describe('#removePlayer', () => {
    it('should remove player at index', () => {
      game.addPlayer();
      game.removePlayer(0);
      assert.isNotOk(game.players[0].occupied, 'player object is set to not occupied');
    });
  });

  describe('#getCards', () => {
    it('should distribute correct cards to player', () => {
      const cards = game.getCards(0);
      assert.equal(cards.length, 8, 'should have 8 cards');
      assert.deepEqual(cards, game.players[0].cards, 'player 0 should have the same cards as the returned result');
    });

    it('should set player with Two of Feathers to be the first player to play card', () => {
      game.deck = [
        { suit: 'Feathers', rank: { name: 'Two' } },
        { suit: 'Sword', rank: { name: 'Three' } },
        { suit: 'Sword', rank: { name: 'King' } },
        { suit: 'Cups', rank: { name: 'Two' } },
        { suit: 'Sun', rank: { name: 'Queen' } },
        { suit: 'Sun', rank: { name: 'Horse' } },
        { suit: 'Feathers', rank: { name: 'Seven' } },
        { suit: 'Sword', rank: { name: 'Six' } },
      ];
      game.getCards(3);
      assert.deepEqual(game.playerOrder, [3, 4, 0, 1, 2], 'playerOrder has the correct order');
    });
  });

  describe('#playCard', () => {
    it('should set the card to currentRound', () => {
      const card = { suit: 'Feathers', rank: { name: 'Seven' } };
      game.playCard(card);
      assert.deepEqual(game.currentRound[0], card);
    });
  });

  describe('#setReadyStatus', () => {
    it('should set the player at index to correct ready status', () => {
      game.setReadyStatus(0, true);
      assert.ok(game.players[0].ready);
    });
  });

  describe('#playersReady', () => {
    it('should return false when at least one player is not ready', () => {
      assert.isNotOk(game.playersReady(), 'none of the players is ready');

      game.setReadyStatus(0, true);
      game.setReadyStatus(1, true);
      game.setReadyStatus(2, true);
      game.setReadyStatus(3, true);
      game.setReadyStatus(4, true);
      assert.isOk(game.playersReady(), 'all the players are ready');
    });
  });

  describe('#setCalledCard()', () => {
    it('should set properties correctly', () => {
      const calledCard = { name: 'Ace', suit: 'Sun' };
      game.players[0].cards = [{ name: 'Three', suit: 'Sword' }];
      game.players[1].cards = [{ name: 'Ace', suit: 'Sun' }];
      game.players[2].cards = [{ name: 'Five', suit: 'Cup' }];
      game.players[3].cards = [{ name: 'Four', suit: 'Feather' }];
      game.players[4].cards = [{ name: 'King', suit: 'Sword' }];
      game.setCalledCard(0, calledCard);

      assert.equal(game.calledCard, calledCard, 'called card is set');
      assert.equal(game.trump, calledCard.suit, 'trump is set');
      assert.equal(game.caller, 0, 'caller is set');
      assert.equal(game.guiltyPlayer, 1, 'guilty player is set');
    });
  });

  describe('#getNextPlayer', () => {
    it('should return the next player for playing card', () => {
      game.playerOrder = [4, 5, 0, 1, 2];
      assert.equal(game.getNextPlayer(), 4, 'next player is 4');
    });

    it('should return correct number when there is no next player available', () => {
      game.playerOrder = [];
      assert.equal(game.getNextPlayer(), -1);
    });
  });

  describe('#getRoundResult()', () => {
    it('should reset currentRound after getting round result', () => {
      game.trump = 'Feather';
      playSet();

      game.getRoundResult();
      assert.equal(game.currentRound.length, 0, 'Resets currentRound');
    });

    it('should calculate score correctly', () => {
      game.trump = 'Sun';
      playSet();

      game.getRoundResult();
      const scores = game.players.map(player => player.score);

      assert.deepEqual(scores, [0, 0, 0, 0, 8], 'Each player has the correct score');
    });

    it('should return trump card when there is only one trump', () => {
      const expected = {
        name: 'Two',
        playerIndex: 1,
        playerName: 'Player 1',
        suit: 'Feather',
        point: 0,
        value: 1,
      };
      game.trump = 'Feather';
      playSet();

      assert.deepEqual(game.getRoundResult(), expected, 'Player 1 is the winner of the round');
    });

    it('should return largest card of the leading suit', () => {
      const expected = {
        playerIndex: 4,
        playerName: 'Player 4',
        name: 'King',
        suit: 'Cup',
        point: 4,
        value: 8,
      };
      game.trump = 'Sun';
      game.playCard(createPlayedCard(0, 'Player 0', 'Cup', 'Six'));
      game.playCard(createPlayedCard(1, 'Player 1', 'Feather', 'Two'));
      game.playCard(createPlayedCard(2, 'Player 2', 'Cup', 'Queen'));
      game.playCard(createPlayedCard(3, 'Player 3', 'Sword', 'Four'));
      game.playCard(createPlayedCard(4, 'Player 4', 'Cup', 'King'));

      assert.deepEqual(game.getRoundResult(), expected, 'Player 4 is the winner of the round');
    });

    it('should return largest trump', () => {
      const expected = {
        playerIndex: 4,
        playerName: 'Player 4',
        suit: 'Sun',
        name: 'King',
        point: 4,
        value: 8,
      };
      game.trump = 'Sun';
      playSet();

      assert.deepEqual(game.getRoundResult(), expected, 'Player 4 is the winner of the round');
    });

    it('should update the score of players', () => {
      game.trump = 'A';
      playSet();

      game.getRoundResult();
      assert.deepEqual(game.getScores(), [0, 0, 0, 0, 8]);
    });
  });

  describe('#submitBid', () => {
    it('should set the larger number as the highest bid', () => {
      game.submitBid({ passed: false, points: 10 }, 0);
      assert.equal(game.bid, 10, 'bid is set to 10');

      game.submitBid({ passed: false, points: 20 }, 1);
      assert.equal(game.bid, 20, 'bid is set to 20');
    });

    it('should set player at index to pass the bid', () => {
      game.submitBid({ passed: true }, 3);
      assert.ok(game.players[3].passed, 'player 3 passes the bid');
      assert.equal(game.passedBidPlayers, 1, 'passedBidPlayers increments by 1');
    });
  });

  describe('#getBid', () => {
    it('should return the current highest bid', () => {
      game.submitBid({ passed: false, points: 20 }, 0);
      game.submitBid({ passed: false, points: 13 }, 1);
      game.submitBid({ passed: true }, 2);
      assert.equal(game.getBid(), 20);
    });

    it('should return the current highest bid', () => {
      game.submitBid({ passed: false, points: 20 }, 0);
      game.submitBid({ passed: true }, 1);
      game.submitBid({ passed: true }, 2);
      game.submitBid({ passed: true }, 3);
      game.submitBid({ passed: true }, 4);
      assert.equal(game.getBid(), 20);
    });
  });

  describe('#getCaller', () => {
    it('should return index of the only player who did not pass bid', () => {
      game.addPlayer('Player 0');
      game.submitBid({ passed: false, points: 20 }, 0);
      game.submitBid({ passed: true }, 1);
      game.submitBid({ passed: true }, 2);
      game.submitBid({ passed: true }, 3);
      game.submitBid({ passed: true }, 4);
      assert.deepEqual(game.getCaller(), { name: 'Player 0', index: 0 }, 'Player 0 is the caller');
    });

    it('should return null if less than four players have passed bid', () => {
      assert.isNull(game.getCaller());
    });
  });

  describe('#getScores', () => {
    it('should return the cumulative score of all the players', () => {
      assert.deepEqual(game.getScores(), [0, 0, 0, 0, 0], 'all the playersh should have the same score initially');
    });
  });

  describe('#isGameOver', () => {
    it('should return true if the game has played for five rounds', () => {
      assert.isNotOk(game.isGameOver(), 'game is not over yet');
      game.roundCount = 5;
      assert.ok(game.isGameOver(), 'game is over');
    });
  });

  describe('#getFinalResult', () => {
    it('should return correct final result', () => {
      playSet();
      game.trump = 'Sword';
      game.caller = 4;
      game.guiltyPlayer = 0;
      game.getRoundResult();
      game.bid = 20;

      const result = game.getFinalResult();
      assert.deepEqual(result, {
        guiltyPoints: 0,
        nonGuiltyPoints: 8,
        bid: 20,
      });
    });
  });
});
