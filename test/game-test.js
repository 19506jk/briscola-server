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
      assert.equal(game.players.length, 5, 'players array is set');
      assert.deepEqual(game.players[0], {
        score: 0,
        cards: null,
        occupied: false,
        ready: false
      }, 'player object is set correctly');
    });
  });

  describe('#_rotateOrder', () => {
    it('should rotate array correctly', () => {
      const arr = game._rotateOrder(2);
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

  describe('#getRoundResult()', () => {
    it('should reset currentRound after getting round result', () => {
      game.playCard({
        player: 0,
        info: { suit: 'A', point: 1, value: 1 },
      });
      game.playCard({
        player: 1,
        info: { suit: 'B', point: 2, value: 5 },
      });
      game.playCard({
        player: 2,
        info: { suit: 'C', point: 3, value: 7 },
      });
      game.playCard({
        player: 3,
        info: { suit: 'A', point: 4, value: 10 },
      });
      game.playCard({
        player: 4,
        info: { suit: 'A', point: 5, value: 11 },
      });
      game.trump = 'B';

      game.getRoundResult();
      assert.equal(game.currentRound.length, 0, 'Resets currentRound');
    });

    it('should calculate score correctly', () => {
      game.playCard({
        player: 0,
        info: { suit: 'A', point: 1, value: 1 },
      });
      game.playCard({
        player: 1,
        info: { suit: 'B', point: 2, value: 5 },
      });
      game.playCard({
        player: 2,
        info: { suit: 'C', point: 3, value: 7 },
      });
      game.playCard({
        player: 3,
        info: { suit: 'A', point: 4, value: 10 },
      });
      game.playCard({
        player: 4,
        info: { suit: 'A', point: 5, value: 11 },
      });
      game.trump = 'B';

      game.getRoundResult();
      const scores = game.players.map(player => player.score);

      assert.deepEqual(scores, [0, 15, 0, 0, 0], 'Each player has the correct score');
    });

    it('should return trump card when there is only one trump', () => {
      game.playCard({
        player: 0,
        info: { suit: 'A', point: 1, value: 1 },
      });
      game.playCard({
        player: 1,
        info: { suit: 'B', point: 2, value: 5 },
      });
      game.playCard({
        player: 2,
        info: { suit: 'C', point: 3, value: 7 },
      });
      game.playCard({
        player: 3,
        info: { suit: 'A', point: 4, value: 10 },
      });
      game.playCard({
        player: 4,
        info: { suit: 'A', point: 5, value: 11 },
      });
      game.trump = 'B';

      assert.deepEqual(game.getRoundResult(), {
        player: 1,
        info: { suit: 'B', point: 2, value: 5 },
      }, 'Player 1 is the winner of the round');
    });

    it('should return largest card of the leading suit', () => {
      game.playCard({
        player: 0,
        info: { suit: 'A', point: 1, value: 1 },
      });
      game.playCard({
        player: 1,
        info: { suit: 'C', point: 2, value: 5 },
      });
      game.playCard({
        player: 2,
        info: { suit: 'C', point: 3, value: 7 },
      });
      game.playCard({
        player: 3,
        info: { suit: 'A', point: 4, value: 10 },
      });
      game.playCard({
        player: 4,
        info: { suit: 'A', point: 5, value: 11 },
      });
      game.trump = 'B';

      assert.deepEqual(game.getRoundResult(), {
        player: 4,
        info: { suit: 'A', point: 5, value: 11 },
      }, 'Player 4 is the winner of the round');
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
      game.players[0].cards = [{ rank: { name: 'Three' }, suit: 'Sword' }];
      game.players[1].cards = [{ rank: { name: 'Ace' }, suit: 'Sun' }];
      game.players[2].cards = [{ rank: {name: 'Five' }, suit: 'Cup' }];
      game.players[3].cards = [{ rank: { name: 'Four' }, suit: 'Feather' }];
      game.players[4].cards = [{ rank: { name: 'King' }, suit: 'Sword' }];
      game.setCalledCard(0, calledCard);

      assert.equal(game.calledCard, calledCard, 'called card is set');
      assert.equal(game.trump, calledCard.suit, 'trump is set');
      assert.equal(game.caller, 0, 'caller is set');
      assert.equal(game.guiltyPlayer, 1, 'guilty player is set');
    });
  });
});
