(function ({
  state,
  getObj,
  log,
  rng,
  grid,
  playCardToTable,
  placed,
  getThumb,
  sendChat,
  offset,
  hOffset,
  vOffset,
  offsets,
  findObjs,
  createObj,
  Campaign
}) {
  // log('QuestCrawlCard')
  function QuestCrawlCard ({ x, y, id, cardid, faceup, blank = false }) {
    const { mode } = state.QuestCrawl.config
    this.x = x
    this.y = y
    this.id = id
    this.cardid = cardid
    this.blank = blank

    try {
      this.card = getObj('card', cardid)
      this.name = this.card.get('name')
      this.face = this.name.split(' ')[0].toLowerCase()
      this.suit = this.name.split(' ').pop().toLowerCase()
    } catch (e) {
      log(`error getting object ${e.message}`)
    }

    if (mode === 'original') {
      this.neighbors = [
        { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
        { x: -1, y: 0 }, { x: 1, y: 0 },
        { x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 }
      ]
      this.cardSize = 70
    } else if (mode === 'hexagon') {
      this.neighbors = [
        { x: -0.5, y: -1 },
        { x: 0.5, y: -1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: -0.5, y: 1 },
        { x: 0.5, y: 1 }
      ]
      this.cardSize = {
        w: 75,
        h: 88
      }
    }
    if (faceup) {
      this.flip()
    }
  }

  QuestCrawlCard.prototype = {
    getCoordString: function () { return `${this.x.toFixed(1)},${this.y.toFixed(1)}` },
    getRandomNeighborCoords: function () {
      let { x, y } = this
      const n = this.neighbors[Math.floor(global.rng() * (this.neighbors.length - 1))]
      x += n.x
      y += n.y
      const openSlots = this.neighbors.some((n) => {
        return !global.grid.get({ x: this.x + n.x, y: this.y + n.y }).id
      })
      if (!openSlots) {
        global.open.splice(open.indexOf(this), 1)
      }
      return { x, y }
    },
    getAllNeighbors: function () {
      const { x, y } = this
      return this.neighbors.map((n) => {
        return grid.get({ x: x + n.x, y: y + n.y })
      })
    },
    place: function (faceup = false) {
      const { mode } = state.QuestCrawl.config
      if (faceup) {
        this.faceup = faceup
      }
      if (mode === 'original') {
        playCardToTable(this.cardid, {
          ...global.toScreenGrid(this, this.cardSize),
          layer: 'map',
          currentSide: this.faceup ? 0 : 1
        })
      } else if (mode === 'hexagon') {
        playCardToTable(this.cardid, {
          ...global.toScreenHex(this, this.cardSize),
          layer: 'map',
          currentSide: this.faceup ? 0 : 1
        })
      } else {
        throw new Error(`Invalid mode unknown: ${mode}`)
      }
      global.grid.put(this)
      if (global.placed.indexOf(this) === -1) {
        global.placed.push(this)
      }
      if (global.open.indexOf(this) === -1) {
        global.open.push(this)
      }
    },
    getGraphic: function () {
      return getObj('graphic', this.id)
    },
    toString: function () {
      return `${this.name}:${this.x}:${this.y}`
    },
    toJSON: function () {
      return {
        x: this.x,
        y: this.y,
        cardid: this.cardid,
        id: this.id,
        name: this.name,
        faceup: this.faceup,
        blank: this.blank,
        face: this.face,
        suit: this.suit
      }
    },
    flip: function (remote = false) {
      this.faceup = !this.faceup
      const side = this.faceup ? 0 : 1
      this.getGraphic().set({
        currentSide: side,
        imgsrc: decodeURIComponent(getThumb(this.getGraphic().get('sides').split('|')[side]))
      })

      const name = this.name
      if (remote) {
        if (name.indexOf('Nine') === 0) {
          setTimeout(() => {
            sendChat('QuestCrawl', `${name} is a Crisis, flipping back down.`)
            this.flip()
          }, 3000)
        }
      }
      if (name.indexOf('Ace') === 0 || name === 'King of Hearts') {
        state.QuestCrawl.mountains = state.QuestCrawl.mountains || {}
        state.QuestCrawl.mountains[name] = this
      }
    },
    makeBlank: function () {
      this.blank = true
    },
    move: function ({ x, y }) {
      const { mode } = state.QuestCrawl.config
      this.x = x
      this.y = y
      if (mode === 'original') {
        this.getGraphic().set({
          left: offset + (this.x * this.cardSize),
          top: offset + (this.y * this.cardSize)
        })
      } else if (mode === 'hexagon') {
        this.getGraphic().set({
          left: hOffset + (this.x * this.cardSize.w),
          top: vOffset + (this.y * offsets.y)
        })
      }
    }
  }

  // log('GapCard')
  function GapCard ({ x, y }) {
    const { mode } = state.QuestCrawl.config
    this.x = x
    this.y = y
    this.id = 'Gap'
    this.cardid = 'Lake'
    this.faceup = true

    if (mode === 'original') {
      this.neighbors = [
        { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
        { x: -1, y: 0 }, { x: 1, y: 0 },
        { x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 }
      ]
      this.cardSize = 70
    } else if (mode === 'hexagon') {
      this.neighbors = [
        { x: -0.5, y: -1 },
        { x: 0.5, y: -1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: -0.5, y: 1 },
        { x: 0.5, y: 1 }
      ]
      this.cardSize = {
        w: 75,
        h: 88
      }
    }
  }

  GapCard.prototype = {
    getCoordString: function () { return `${this.x.toFixed(1)},${this.y.toFixed(1)}` },
    toJSON: function () {
      return {
        x: this.x,
        y: this.y,
        cardid: this.cardid,
        id: this.id,
        faceup: this.faceup
      }
    },
    place: function () {
      const { mode } = state.QuestCrawl.config
      const handout = findObjs({ type: 'handout', name: 'Dark Water' })[0]
      if (handout) {
        if (mode === 'original') {
          createObj('graphic', {
            ...global.toScreenGrid(this, this.cardSize),
            layer: 'gmlayer',
            imgsrc: getThumb(handout.get('avatar')),
            height: 70,
            width: 70,
            pageid: Campaign().get('playerpageid')
          })
        } else if (mode === 'hexagon') {
          createObj('graphic', {
            ...global.toScreenHex(this, this.cardSize),
            imgsrc: getThumb(handout.get('avatar')),
            layer: 'gmlayer',
            height: this.cardSize.h,
            width: this.cardSize.w,
            pageid: Campaign().get('playerpageid')
          })
        } else {
          throw new Error(`Invalid mode unknown: ${mode}`)
        }
      }
      global.grid.put(this)
    },
    toString: function () {
      return `${this.id}:${this.x}|${this.y}`
    },
    getAllNeighbors: function () {
      const { x, y } = this
      return this.neighbors.map((n) => {
        return grid.get({ x: x + n.x, y: y + n.y })
      })
    },
    flip: function () {},
    move: function ({ x, y }) {
      this.x = x
      this.y = y
    }
  }

  global.QuestCrawlCard = QuestCrawlCard
  global.GapCard = GapCard

  if (module) {
    module.exports = global
  }
})(global)
