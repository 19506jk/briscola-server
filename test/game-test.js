import assert from 'assert';
import Game from '../src/game';

describe('Game', () => {
  let game;
  beforeEach(() => {
    game = new Game();
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
