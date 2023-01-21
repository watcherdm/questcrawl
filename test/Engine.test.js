require('./mock.js')
const { QuestCrawlCard } = require('../src/c_Card.js')
const { Grid } = require('../src/c_Grid.js')
const { TurnOrder, recallCards } = require('../src/c_TurnOrder.js')

const { onPartyMoved, init, generateIsland, createObj } = require('../src/b_Engine.js')
describe('Engine', () => {
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
  })

  it('should provide the onPartyMoved method', () => {
    expect(typeof onPartyMoved).toBe('function')
  })
})
