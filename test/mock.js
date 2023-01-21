(function (global) {
  const objectPool = []
  const events = {}
  function emit (event, ...payload) {
    event.split(':').reduce((key, part) => {
      (events[`${key}${part}`] || []).forEach((handler) => handler(...payload))
      return `${key}${part}:`
    }, '')
  }

  function sendChat (who, msg) {
    console.log(`${who}: ${msg}`)
  }

  function getAttrByName (id, key, type) {
    return ((objectPool.find(({ _id }) => _id === id) || {}).attributes[key] ||
      {})[type]
  }

  function getObj (_type, _id) {
    return objectPool.find(({ type, id }) => {
      return _type === type && _id === id
    })
  }

  function randomInteger () {
    return 1
  }

  function on (event, handler) {
    events[event] = events[event] || []
    events[event].push(handler)
  }

  function log (msg) {
    console.log(msg)
  }

  function setAttrs (id, key, val) {
    if (val === undefined && typeof key === 'object') {
      Object.entries(key).forEach(([key, val]) => {
        setAttrs(id, key, val)
      })
      return
    }
    const obj = objectPool.find(({ _id }) => id === _id)
    if (!obj) {
      return
    }
    const prev = { ...obj.attributes }
    obj.attributes[key] = val
    emit(`change:${obj.get('type')}:${key}`, obj, prev)
  }

  function findObjs (params) {
    return objectPool.filter((obj) => {
      return Object.keys(params).every((key) => {
        return obj[key] === params[key] || obj.attributes[key] === params[key]
      })
    })
  }

  function filterObjs (predicate) {
    return objectPool.filter(predicate)
  }

  function Roll20Object (type, params) {
    this.attributes = params
    this.attributes._type = type
    this.id = params._id
    this.type = type
  }

  Roll20Object.prototype = {
    set: function (key, val) {
      setAttrs(this.id, key, val)
    },
    get: function (key) {
      return this.attributes[key]
    }
  }

  function createObj (type, params) {
    const obj = new Roll20Object(type, params)
    objectPool.push(obj)
    emit(`change:${type}`, obj)
    return obj
  }

  function Campaign () {
    if (objectPool[0].type !== 'campaign') {
      objectPool.unshift(new Roll20Object('campaign', {
        turnorder: null
      }))
    }
    return objectPool[0]
  }

  function playCardToTable (cardid, settings) {
    const card = getObj('card', cardid)
    settings._id = card.id.replace('card', 'graphic')
    settings.cardid = cardid
    const graphic = createObj('graphic', settings)
    console.log(graphic)
  }

  function cardInfo ({ type, deckid, cardid, discard = false }) {
    if (type === 'card' && cardid) {
      return findObjs({ type: 'card', id: cardid })
    } else if (deckid) {
      switch (type) {
        case 'graphic':
          break
        case 'hand':
          break
        case 'deck':
          break
        case 'discard':
          break
        case 'all':
          break
        case 'play':
          break
        default:
          break
      }
    }
  }

  function recallCards () {
    deck = new Deck('valid-deckid')
  }

  function shuffleDeck () {
    console.log('shuffleCards called')
  }

  function onSheetWorkerCompleted () {
    console.log('onSheetWorkerCompleted called')
  }

  function Deck (id) {
    this.id = id
    this.cards = []
    let i = 0;
    ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Jack', 'Queen', 'King'].forEach((face) => {
      ['Hearts', 'Clubs', 'Diamonds', 'Spades'].forEach((suit) => {
        const card = createObj('card', { _id: `-card-test-id-${i}`, name: `${face} of ${suit}`, deckid: id })
        this.cards.push(card)
        i++
      })
    });
    ['Red', 'Black'].forEach((color) => {
      const card = createObj('card', { _id: `-card-test-id-${i}`, name: `${color} Joker`, deckid: id })
      this.cards.push(card)
      i++
    })
  }

  let deck = new Deck('valid-deckid')

  function drawCard (deckid) {
    if (deckid === 'valid-deckid') {
      return deck.cards.shift().id
    }
  }

  function toFront () {

  }

  global.sendChat = sendChat
  global.getAttrByName = getAttrByName
  global.getObj = getObj
  global.randomInteger = randomInteger
  global.on = on
  global.log = log
  global.setAttrs = setAttrs
  global.findObjs = findObjs
  global.filterObjs = filterObjs
  global.createObj = createObj
  global.Campaign = Campaign
  global.playCardToTable = playCardToTable
  global.cardInfo = cardInfo
  global.recallCards = recallCards
  global.shuffleDeck = shuffleDeck
  global.onSheetWorkerCompleted = onSheetWorkerCompleted
  global.drawCard = drawCard
  global.toFront = toFront
  global.state = {
    QuestCrawl: {
      config: {
        mode: 'original'
      }
    }
  }

  if (module) {
    module.exports = global
  }
})(global)
