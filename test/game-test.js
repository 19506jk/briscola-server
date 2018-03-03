import { assert } from 'chai';
import Game from '../src/game';

describe('Game', () => {
  let game;
  beforeEach(() => {
    game = new Game();
  });

  describe('#constructor', () => {
    it('should initialize the game correctly', () => {
      assert.equal(game.deck.length, 40, 'the deck is set');
      assert.deepEqual(game.players, [null, null, null, null, null], 'players array is set');
    });
  });

  describe('#_rotateOrder', () => {
    it('should rotate array correctly', () => {
      const arr = game._rotateOrder(2);
      assert.deepEqual(arr, [2, 3, 4, 0, 1]);
    });
  });

  describe('#_updateScore', () => {
    it('should update player scores with the given array', () => {
      const arr = [1, 2, 3, 4, 5];
      arr.forEach(() => game.addPlayer());
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

    it('should add player object correctly', () => {
      game.addPlayer();
      const player = game.players[0];

      assert.equal(player.score, 0);
      assert.isNull(player.cards);
    });
  });

  describe('#getRoundResult()', () => {
    it('should reset currentRound after getting round result', () => {
      game.playCard({
        player: 1,
        info: { suit: 'A', point: 1, value: 1 },
      });
      game.playCard({
        player: 2,
        info: { suit: 'B', point: 2, value: 5 },
      });
      game.playCard({
        player: 3,
        info: { suit: 'C', point: 3, value: 7 },
      });
      game.playCard({
        player: 4,
        info: { suit: 'A', point: 4, value: 10 },
      });
      game.playCard({
        player: 5,
        info: { suit: 'A', point: 5, value: 11 },
      });
      game.trump = 'B';

      game.getRoundResult();
      assert.equal(game.currentRound.length, 0, 'Resets currentRound');
    });

    it('should calculate score correctly', () => {
      game.playCard({
        player: 1,
        info: { suit: 'A', point: 1, value: 1 },
      });
      game.playCard({
        player: 2,
        info: { suit: 'B', point: 2, value: 5 },
      });
      game.playCard({
        player: 3,
        info: { suit: 'C', point: 3, value: 7 },
      });
      game.playCard({
        player: 4,
        info: { suit: 'A', point: 4, value: 10 },
      });
      game.playCard({
        player: 5,
        info: { suit: 'A', point: 5, value: 11 },
      });
      game.trump = 'B';

      game.getRoundResult();
      assert.deepEqual(game.scores, [0, 15, 0, 0, 0], 'Each player has the correct score');
    });

    it('should return trump card when there is only one trump', () => {
      game.playCard({
        player: 1,
        info: { suit: 'A', point: 1, value: 1 },
      });
      game.playCard({
        player: 2,
        info: { suit: 'B', point: 2, value: 5 },
      });
      game.playCard({
        player: 3,
        info: { suit: 'C', point: 3, value: 7 },
      });
      game.playCard({
        player: 4,
        info: { suit: 'A', point: 4, value: 10 },
      });
      game.playCard({
        player: 5,
        info: { suit: 'A', point: 5, value: 11 },
      });
      game.trump = 'B';

      assert.deepEqual(game.getRoundResult(), {
        player: 2,
        info: { suit: 'B', point: 2, value: 5 },
      }, 'Player 2 is the winner of the round');
    });

    it('should return largest card of the leading suit', () => {
      game.playCard({
        player: 1,
        info: { suit: 'A', point: 1, value: 1 },
      });
      game.playCard({
        player: 2,
        info: { suit: 'C', point: 2, value: 5 },
      });
      game.playCard({
        player: 3,
        info: { suit: 'C', point: 3, value: 7 },
      });
      game.playCard({
        player: 4,
        info: { suit: 'A', point: 4, value: 10 },
      });
      game.playCard({
        player: 5,
        info: { suit: 'A', point: 5, value: 11 },
      });
      game.trump = 'B';

      assert.deepEqual(game.getRoundResult(), {
        player: 5,
        info: { suit: 'A', point: 5, value: 11 },
      }, 'Player 5 is the winner of the round');
    });

    it('should return largest trump', () => {
      game.playCard({
        player: 1,
        info: { suit: 'A', point: 1, value: 1 },
      });
      game.playCard({
        player: 2,
        info: { suit: 'C', point: 2, value: 5 },
      });
      game.playCard({
        player: 3,
        info: { suit: 'C', point: 3, value: 7 },
      });
      game.playCard({
        player: 4,
        info: { suit: 'A', point: 4, value: 10 },
      });
      game.playCard({
        player: 5,
        info: { suit: 'A', point: 5, value: 11 },
      });
      game.trump = 'A';

      assert.deepEqual(game.getRoundResult(), {
        player: 5,
        info: { suit: 'A', point: 5, value: 11 },
      }, 'Player 5 is the winner of the round');
    });
  });

  describe('#setCalledCard()', () => {
    it('should set properties correctly', () => {
      const calledCard = { name: 'Ace', suit: 'Sun' };
      game.playerHands = [
        [{ name: 'Three', suit: 'Sword' }],
        [{ name: 'Ace', suit: 'Sun' }],
        [{ name: 'Seven', suit: 'Feather' }],
        [{ name: 'Two', suit: 'Sword' }],
        [{ name: 'Ace', suit: 'Cup' }],
      ];
      game.setCalledCard(0, calledCard);

      assert.equal(game.calledCard, calledCard, 'called card is set');
      assert.equal(game.trump, calledCard.suit, 'trump is set');
      assert.equal(game.caller, 0, 'caller is set');
      assert.equal(game.guiltyPlayer, 1, 'guilty player is set');
    });
  });
});
