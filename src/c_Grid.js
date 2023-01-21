(function ({ QuestCrawlCard, GapCard }) {
  // log('Grid')
  function Grid () {
    this.internal = {}
    this.setup = true
  }

  Grid.prototype = {
    get: function (coord) {
      const { getCoordString } = QuestCrawlCard.prototype
      const card = this.internal[`${getCoordString.call(coord)}`]
      if (card) {
        return card
      } else {
        return (this.setup) ? coord : new GapCard(coord)
      }
    },
    put: function (card) {
      this.internal[card.getCoordString()] = card
    },
    remove: function (card) {
      if (card.getCoordString) {
        const coordString = card.getCoordString()
        if (this.internal[coordString] === card || card.id === 'Gap') {
          delete this.internal[coordString]
        }
      }
    },
    toJSON: function () {
      return Object.values(this.internal)
    },
    move: function (card, coords) {
      this.remove(card)
      card.move(coords)
    }
  }

  Grid.fromJSON = function (data) {
    if (!Array.isArray(data)) {
      return new Grid()
    }
    const grid = data.reduce((g, card) => {
      if (card.cardid === 'Lake') {
        g.put(new GapCard(card))
      } else {
        g.put(new QuestCrawlCard(card))
      }
      return g
    }, (new Grid()))
    grid.setup = false
    return grid
  }

  global.Grid = Grid

  if (module) {
    module.exports = global
  }
})(global)
