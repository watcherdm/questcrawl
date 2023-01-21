const { createObj } = require('./mock.js')
const { QuestCrawlCard, GapCard } = require('../src/c_Card.js')
const { Grid } = require('../src/c_Grid')

createObj('card', { _id: 1, name: 'Ace of Spades' })
createObj('card', { _id: 2, name: 'Test of Card' })

describe('Grid', () => {
  it('should exist', () => {
    expect(Grid).not.toBe(undefined)
  })
  it('should be a function', () => {
    expect(typeof Grid).toBe('function')
  })
  describe('fromJSON', () => {
    it('should be a static method', () => {
      expect(Grid.fromJSON).not.toBe(undefined)
      expect(typeof Grid.fromJSON).toBe('function')
    })
    it('should allow being called with no value', () => {
      expect(() => Grid.fromJSON()).not.toThrow()
    })
    it('should allow being called with a world state', () => {
      expect(() => Grid.fromJSON([
        {
          id: 1,
          x: 0,
          y: 0,
          cardid: 1,
          blank: false
        }
      ])).not.toThrow()
    })
  })

  describe('instance', () => {
    const grid = new Grid()
    describe('put', () => {
      it('should keep the card in memory', () => {
        const card = new QuestCrawlCard({ x: 1, y: 1, id: 2, cardid: 2, faceup: false, blank: false })
        grid.put(card)
        expect(grid.internal['1.0,1.0']).toBe(card)
      })
    })
    describe('get', () => {
      describe('valid coords, where no data exists', () => {
        describe('setup property', () => {
          describe('true', () => {
            beforeEach(() => {
              grid.setup = true
            })
            it('should return coords', () => {
              const coords = { x: 0, y: 0 }
              const card = grid.get(coords)
              expect(card).not.toBe(undefined)
              expect(card).toBe(coords)
            })
          })
          describe('false', () => {
            beforeEach(() => {
              grid.setup = false
            })
            it('should return a new GapCard', () => {
              const coords = { x: 0, y: 0 }
              const card = grid.get(coords)
              expect(card).not.toBe(undefined)
              expect(card).not.toBe(coords)
              expect(card instanceof GapCard).toBe(true)
            })
          })
        })
      })

      describe('valid coords, where data exists', () => {
        it('should return the card for that instance', () => {
          grid.put(new QuestCrawlCard({ x: 1, y: 1, id: 2, cardid: 2, faceup: false, blank: false }))
          const card = grid.get({ x: 1, y: 1 })
          expect(card.name).toBe('Test of Card')
          expect(card.face).toBe('test')
          expect(card.suit).toBe('card')
        })
      })
    })
    describe('remove', () => {
      it('should remove the card if it matches', () => {
        const card = new QuestCrawlCard({ x: 1, y: 1, id: 2, cardid: 2, faceup: false, blank: false })
        grid.put(card)
        expect(grid.internal['1.0,1.0']).toBe(card)
        grid.remove(card)
        expect(grid.internal['1.0,1.0']).toBe(undefined)
      })
    })
  })
})
