require('./mock.js')
const { QuestCrawlCard } = require('../src/c_Card.js')
const { getPartyToken } = require('../src/c_Party')
const { Grid } = require('../src/c_Grid.js')
const { TurnOrder, recallCards } = require('../src/c_TurnOrder.js')

const {
  onPartyMoved,
  init,
  generateIsland,
  createObj,
  resetBoard,
  toScreenGrid,
  resetRng
} = require('../src/b_Engine.js')
describe('Engine', () => {
  beforeAll(() => {
    createObj('character', { name: 'Party', avatar: 'test.url', _id: 'valid-character-id' })
    createObj('graphic', {
      name: 'Party',
      imgsrc: 'test.url',
      _id: 'valid-graphic-id-1',
      pageid: global.getPageId(),
      layer: 'objects',
      height: 70,
      width: 70
    })
  })

  it('should provide the init method', () => {
    expect(typeof init).toBe('function')
  })
  describe('init', () => {
    it('should set the global grid and turnorder', () => {
      const state = {
        QuestCrawl: {
          grid: false,
          turnorder: false
        }
      }
      init(state)
      expect(global.grid).toBeInstanceOf(Grid)
      expect(global.turnorder).toBeInstanceOf(TurnOrder)
    })
  })

  describe('generateIsland', () => {
    describe('home town already exists', () => {
      let mockShuffleDeck
      beforeEach(() => {
        const state = {
          QuestCrawl: {
            grid: [{ x: 0, y: 0, id: 'hometowngraphic', cardid: 'red-joker-1' }],
            turnorder: false
          }
        }
        mockShuffleDeck = jest.spyOn(global, 'shuffleDeck')
        init(state)
        expect(global.grid).toBeInstanceOf(Grid)
        expect(global.turnorder).toBeInstanceOf(TurnOrder)
      })
      afterEach(() => {
        jest.restoreAllMocks()
      })
      it('should exit if the grid already has a home town', () => {
        generateIsland('invalid-deck-id', [])
        expect(mockShuffleDeck).not.toHaveBeenCalled()
      })
    })
    describe('empty grid', () => {
      beforeEach(() => {
        createObj('card', { id: 'hometown-id', deckid: 'valid-deckid', name: 'Red Joker' })
        const state = {
          QuestCrawl: {
            grid: [],
            turnorder: false
          }
        }
        init(state)
        global.grid.setup = true
        global.placed = []
        recallCards()
      })
      it('should not throw', () => {
        expect(() => generateIsland('valid-deckid', [])).not.toThrow()
      })
      it('should draw the hometown card', () => {
        const drawCardSpy = jest.spyOn(global, 'drawCard')
        generateIsland('valid-deckid', [])
        expect(drawCardSpy).toHaveBeenCalled()
      })
      it('should call place on the hometown card', () => {
        const placeSpy = jest.spyOn(QuestCrawlCard.prototype, 'place')
        generateIsland('valid-deckid', [])
        expect(placeSpy).toHaveBeenCalledWith(true)
      })
      it('should set 54 placed cards', () => {
        generateIsland('valid-deckid', [])
        expect(global.placed.length).toBe(54)
      })
    })
    describe('known seed', () => {
      beforeEach(() => {
        const state = {
          QuestCrawl: {
            grid: [],
            turnorder: false
          }
        }
        init(state)
        resetRng('test-seed')
        global.grid.setup = true
        global.placed = []
        recallCards()
      })
      describe('static', () => {
        it('should return the same grid when static is used', () => {
          generateIsland('valid-deckid', ['--static 1'])
          expect(global.grid.toJSON()).toMatchSnapshot()
        })
      })
      describe('not static', () => {
        it('should place different cards in the same locations', async () => {
          generateIsland('valid-deckid', [])
          const grid1 = global.grid.toJSON()
          await resetBoard()
          resetRng('test-seed')
          generateIsland('valid-deckid', [])
          const grid2 = global.grid.toJSON()
          expect(grid1.map(({ x, y }) => `${x}:${y}`).sort()).toStrictEqual(grid2.map(({ x, y }) => `${x}:${y}`).sort())
          expect(grid1).not.toStrictEqual(grid2)
        })
      })
    })
  })

  describe('onPartyMoved', () => {
    it('should exist as a function', () => {
      expect(typeof onPartyMoved).toBe('function')
    })
    describe('when invoked with party token', () => {
      beforeEach(() => {
        createObj('card', { id: 'hometown-id', deckid: 'valid-deckid', name: 'Red Joker' })
        global.state = {
          QuestCrawl: {
            config: {
              mode: 'original'
            },
            grid: [],
            turnorder: false,
            history: [{ x: 0, y: 0 }]
          }
        }
        return resetBoard().then(() => {
          init(state)
          global.grid.setup = true
          global.placed = []
          recallCards()
          generateIsland('valid-deckid', ['--gaps 0'])
        }).catch((e) => log(e))
      })

      it('should not throw an error', () => {
        expect(() => onPartyMoved(global.grid, getPartyToken())).not.toThrow()
      })
      it('should not allow the party to move to a disconnected territory', () => {
        const partyToken = getPartyToken()
        onPartyMoved(global.grid, partyToken)
        expect(partyToken.get('left')).toBe(1085)
        expect(partyToken.get('top')).toBe(1085)
      })
      it('should allow the party to move to a connected territory', () => {
        const partyToken = getPartyToken()
        const hometown = global.grid.get({ x: 0, y: 0 })
        let moveto = hometown.getRandomNeighbor()
        while (moveto.id.indexOf('-') !== 0) {
          moveto = hometown.getRandomNeighbor()
        }
        onPartyMoved(global.grid, partyToken)
        const newCoords = toScreenGrid(moveto, 70)
        partyToken.set({
          ...newCoords
        })
        onPartyMoved(global.grid, partyToken)
        expect(partyToken.get('left')).toBe(newCoords.left)
      })
      it('should chat the card contents', () => {
        const chatCardSpy = jest.spyOn(global, 'chatCard')
        const partyToken = getPartyToken()
        const hometown = global.grid.get({ x: 0, y: 0 })
        let moveto = hometown.getRandomNeighbor()
        while (moveto.id.indexOf('-') !== 0) {
          moveto = hometown.getRandomNeighbor()
        }
        onPartyMoved(global.grid, partyToken)
        partyToken.set({
          ...toScreenGrid(moveto, 70)
        })
        onPartyMoved(global.grid, partyToken)
        expect(chatCardSpy).toHaveBeenCalled()
      })
    })
  })
})
