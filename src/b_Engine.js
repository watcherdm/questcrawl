(function ({
  game,
  open,
  placed,
  Grid,
  TurnOrder,
  state,
  sendError,
  findObjs,
  sendChat,
  getObj,
  Campaign,
  randomInteger,
  QuestCrawlCard,
  GapCard,
  toFront
}) {
  let cardSize = 70
  const offset = 1085
  const vOffset = 847
  const hOffset = 864
  const offsets = {
    x: 37.5,
    y: 67
  }

  const numberMap = {
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8
  }

  function getThumb (img) {
    return img.replace('med.png', 'thumb.png')
  }

  // log('getCommand')
  function getCommand (name, card) {
    const { commands } = game
    if ((state.QuestCrawl.config || {}).commands) {
      if (commands[name]) return commands[name](card)
    }
    return ''
  }

  function chatCard (card, logEntry, name) {
    const handout = findObjs({ type: 'handout', name })[0]
    return new Promise((resolve) => {
      handout.get('notes', (note) => {
        const title = note.split('</h1>')[0]
        sendChat('QuestCrawl', `<div>
                    <img src="${handout.get('avatar')}"/>
                    <h5>${logEntry.name} ${card.blank ? 'Random Encounter!' : ''}</h5>
                    <p>${note}<p>
                    <p>${getCommand(name, card)}</p>
                </div>`)
        resolve(`${title.replace('<h1>', '')}`)
      })
    })
  }
  function toCoords (left, top) {
    const { mode } = state.QuestCrawl.config
    if (mode === 'original') {
      return { x: (left - offset) / cardSize, y: (top - offset) / cardSize }
    } else if (mode === 'hexagon') {
      cardSize = {
        w: 75,
        h: 88
      }
      const x = parseFloat(((left - hOffset) / cardSize.w).toFixed(1), 10)
      const y = parseFloat(((top - vOffset) / offsets.y).toFixed(1))
      return { x, y }
    }
  }

  function getMoveHistory () {
    return state.QuestCrawl.history.filter(x => x.type !== 'map')
  }

  function getLastLogEntry (move = true) {
    if (move) {
      return getMoveHistory().slice(0).pop()
    } else {
      const { history } = state.QuestCrawl
      return history.slice(0).pop()
    }
  }

  function logPartyEvent (event) {
    (getLastLogEntry().events || []).push({ character: null, event })
  }

  function getPirateReach (card) {
    return card.getAllNeighbors().reduce((m, c) => {
      if (c.id === 'Gap') {
        c.getAllNeighbors().map((n) => {
          return n.cardid
        }).forEach((id) => {
          if (m.indexOf(id) === -1) {
            m.push(id)
          }
        })
      } else {
        if (m.indexOf(c.cardid) === -1) {
          m.push(c.cardid)
        }
      }
      return m
    }, [])
  }

  // log('getOnlinePlayers')
  function getOnlinePlayers () {
    const players = findObjs({ type: 'player' })
    return players.filter(p => p.get('online'))
  }

  function getParty () {
    const { getCharacterJSON } = global
    const players = getOnlinePlayers()
    return players.map(p => getCharacterJSON(p))
  }

  function getLiveParty () {
    return getParty().filter(character => character.mode !== 'graveyard')
  }

  function checkQuestInParty (card) {
    return getLiveParty().some(c => c.suit1 === card.suit)
  }
  function checkForEvil (card) {
    const unearthedEvil = card.getAllNeighbors().find((c) => {
      return c.name === 'King of Spades' && c.faceup
    })
    if (unearthedEvil && state.QuestCrawl.factions.unearthed_evil !== 2 && numberMap[card.face]) {
      return true
    }
    return false
  }
  function partyHasWeaponsOfLegend () {
    const party = getParty()
    const wolTotal = party.reduce((wolCount, character) => {
      if (character.items.includes('Weapon of Legend')) return wolCount + 1
      return wolCount
    }, 0)
    return wolTotal >= party.length / 2
  }
  // log('toScreenGrid')
  function toScreenGrid ({ x, y }, cardSize) {
    return {
      left: offset + (x * cardSize),
      top: offset + (y * cardSize)
    }
  }

  // log('toScreenHex')
  function toScreenHex ({ x, y }, cardSize) {
    return {
      left: hOffset + (x * cardSize.w),
      top: vOffset + (y * offsets.y)
    }
  }
  // log('checkEndGame')
  function checkEndGame () {
    const suits = getMoveHistory().filter(card => card.name.indexOf('Queen') === 0).map(c => c.name.split(' ').pop())
    return ['Hearts', 'Diamonds', 'Clubs', 'Spades'].every(suit => suits.includes(suit))
  }

  // log('characterCommands')
  function characterCommands (c) {
    const commands = []
    // checkForBandits(c, commands)
    // checkForMaps(c, commands)
    // checkForHealingHerbs(c, commands)
    // checkForHolyRod(c, commands)
    // checkForBookofSpells(c, commands)
    // checkForOrbOfChaos(c, commands)
    return commands.join(' ')
  }
  function setupEndGame () {
    if (checkEndGame() && !state.QuestCrawl.endgame) {
      const partyMessage = getLiveParty().map((character) => {
        return `${character.name} your ${character.getRandomItem()} will not save you!`
      }).join(' ')
      sendChat('End Beast', `<h1 style="color: #660000;">Pitiful fools, I am in the heart of that which you love most! Come and face me if you dare.</h1> ${partyMessage}`)
      state.QuestCrawl.endgame = true
      const endBeast = findObjs({ type: 'character', name: 'End Beast' })[0]
      const homeTown = global.grid.get({ x: 0, y: 0 })
      homeTown.getGraphic().set({
        imgsrc: getThumb(endBeast.get('avatar'))
      })
    }
  }

  function onPartyMoved (grid, obj) {
    if (obj.get('pageid') !== Campaign().get('playerpageid')) {
      const page = getObj('page', Campaign().get('playerpageid'))
      return sendChat('QuestCrawl', `Party Token Moved on the wrong page. Use page ${page.get('name')}`)
    }
    if (!grid.get({ x: 0, y: 0 }).id) {
      return sendChat('QuestCrawl', 'Game is not running, please click the Start macro for instructions.')
    }
    const left = parseInt(obj.get('left'), 10)
    const top = parseInt(obj.get('top'), 10)
    const coord = toCoords(left, top)
    const logEntry = Object.assign({}, coord)
    const { config } = state.QuestCrawl
    const card = grid.get(coord)
    if (card.id === 'Gap') {
      const oldPrevent = state.QuestCrawl.preventMove
      state.QuestCrawl.preventMove = () => {
        sendChat('QuestCrawl', 'You have attempted to move to an invalid location, returning to last location.')
        state.QuestCrawl.preventMove = oldPrevent
      }
    }
    const lastPos = getLastLogEntry()
    if (lastPos && card.getAllNeighbors) {
      const pirateReach = getPirateReach(card)
      if (state.QuestCrawl.artifacts.pocket_pirate_ship && !pirateReach.includes(grid.get(lastPos).cardid)) {
        state.QuestCrawl.preventMove = () => {
          sendChat('QuestCrawl', 'Invalid move, you can only move to a connected territory or one connected by a gap (pocket pirate ship), returning to last location.')
          state.QuestCrawl.preventMove = false
        }
      } else if (!state.QuestCrawl.artifacts.pocket_pirate_ship && !card.getAllNeighbors().map(x => x.cardid).includes(grid.get(lastPos).cardid)) {
        state.QuestCrawl.preventMove = () => {
          sendChat('QuestCrawl', 'Invalid move, you can only move to a connected territory, returning to last location.')
          state.QuestCrawl.preventMove = false
        }
      }
    }
    let name = card.name
    logEntry.name = name
    if (name.indexOf('Queen') === 0) {
      if (!checkQuestInParty(card)) {
        card.makeBlank()
      }
    }
    if (card.blank) {
      const randomEncounter = randomInteger(6)
      if (randomEncounter < 4) {
        name = name.replace(/^\w+(\sof\s\w+)/, 'Two$1')
      } else if (randomEncounter < 6) {
        name = name.replace(/^\w+(\sof\s\w+)/, 'Five$1')
      } else {
        name = name.replace(/^\w+(\sof\s\w+)/, 'Nine$1')
      }
    }
    if (checkForEvil(card)) {
      name = 'Corrupted by Evil'
    }
    if (card.x === 0 && card.y === 0 && state.QuestCrawl.endgame) {
      name = 'End Beast'
      if (!partyHasWeaponsOfLegend()) {
        state.QuestCrawl.preventMove = () => {
          sendChat('Shop Keeper', 'You are not powerful enough to face the End Beast yet, go and find more Weapons of Legend! If you need my services I will be at the Strange Town.')
          state.QuestCrawl.preventMove = null
        }
      }
    }
    logEntry.asName = name
    if (state.QuestCrawl.preventMove) {
      const { mode } = config
      let screenPos = {}
      if (mode === 'original') {
        screenPos = toScreenGrid(lastPos, card.cardSize)
      }
      if (mode === 'hexagon') {
        screenPos = toScreenHex(lastPos, card.cardSize)
      }
      obj.set(screenPos)
      state.QuestCrawl.preventMove()
      return
    }
    if (!card.faceup && card.flip) {
      card.flip()
    }
    state.QuestCrawl.history.push(logEntry)
    chatCard(card, logEntry, name).then((title) => {
      logPartyEvent(title)
      state.QuestCrawl.currentMagicItem = null
      getLiveParty().forEach((character) => {
        const commands = characterCommands(character)
        if (commands.length > 0) {
          sendChat('QuestCrawl', `/w ${character.who} ${commands}`)
        }
      })
      setupEndGame()
      state.QuestCrawl.preventMove = () => {
        sendChat('QuestCrawl', 'You have already moved this turn. []')
      }
    })
  }
  const generateUUID = (() => {
    let a = 0
    const b = []
    return () => {
      let c = (new Date()).getTime() + 0
      let f = 7
      const e = new Array(8)
      const d = c === a
      a = c
      for (; f >= 0; f--) {
        e[f] = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'.charAt(c % 64)
        c = Math.floor(c / 64)
      }
      c = e.join('')
      if (d) {
        for (f = 11; f >= 0 && b[f] === 63; f--) {
          b[f] = 0
        }
        b[f]++
      } else {
        for (f = 0; f < 12; f++) {
          b[f] = Math.floor(64 * Math.random())
        }
      }
      for (f = 0; f < 12; f++) {
        c += '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'.charAt(b[f])
      }
      return c
    }
  })()

  // log('cyrb128')
  function cyrb128 (str) {
    let h1 = 1779033703; let h2 = 3144134277
    let h3 = 1013904242; let h4 = 2773480762
    for (let i = 0, k; i < str.length; i++) {
      k = str.charCodeAt(i)
      h1 = h2 ^ Math.imul(h1 ^ k, 597399067)
      h2 = h3 ^ Math.imul(h2 ^ k, 2869860233)
      h3 = h4 ^ Math.imul(h3 ^ k, 951274213)
      h4 = h1 ^ Math.imul(h4 ^ k, 2716044179)
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067)
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233)
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213)
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179)
    return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0]
  }

  function mulberry32 (a) {
    return function () {
      let t = a += 0x6D2B79F5
      t = Math.imul(t ^ t >>> 15, t | 1)
      t ^= t + Math.imul(t ^ t >>> 7, t | 61)
      return ((t ^ t >>> 14) >>> 0) / 4294967296
    }
  }

  function resetRng (seed) {
    if (seed) {
      if (state.QuestCrawl.config.seed) {
        state.QuestCrawl.config.originalSeed = state.QuestCrawl.config.seed
      }
      state.QuestCrawl.seedGenerated = true
      state.QuestCrawl.config.seed = seed
    } else if (!state.QuestCrawl.config.seed) {
      state.QuestCrawl.seedGenerated = true
      state.QuestCrawl.config.seed = generateUUID()
    } else {
      state.QuestCrawl.seedGenerated = false
    }
    const salt = cyrb128(state.QuestCrawl.config.seed)
    global.rng = mulberry32(salt[0])
  }

  function init (state) {
    resetRng()
    if (state.QuestCrawl.grid) {
      try {
        global.grid = Grid.fromJSON(state.QuestCrawl.grid)
      } catch (e) {
        global.grid = new Grid()
      }
      state.QuestCrawl.endgame = false
    } else {
      global.grid = new Grid()
    }
    if (state.QuestCrawl.turnorder) {
      global.turnorder = new TurnOrder(state.QuestCrawl.turnorder)
    } else {
      global.turnorder = new TurnOrder()
    }
    global.open = []
    global.placed = []
  }
  function getParams (args, offset) {
    return args.slice(offset).reduce((m, x) => {
      const [key, value] = x.split(' ')
      m[key] = value
      return m
    }, {})
  }

  // log('getNumericParams')
  function getNumericParams (args, offset) {
    return args.slice(offset).reduce((m, x) => {
      const [key, value] = x.split(' ')
      m[key] = parseInt(value, 10)
      return m
    }, {})
  }

  function getCardsFromDeck (deckid) {
    return findObjs({ type: 'card', deckid }).sort((a, b) => {
      const aname = a.get('name')
      const bname = b.get('name')
      if (aname > bname) {
        return 1
      } else if (bname > aname) {
        return -1
      } else {
        return 0
      }
    }).sort(() => {
      return Math.floor(global.rng() * 2) - 1
    }).map(x => x.id)
  }

  function getRandomOpenCard () {
    return global.open[Math.floor(global.rng() * (global.open.length - 1))]
  }

  function generateIsland (deckid, args) {
    if (global.grid.get({ x: 0, y: 0 }).cardid) {
      return
    }

    const params = getParams(args, 2)
    let { gaps } = state.QuestCrawl.config

    if (params.static) {
      shuffleDeck(deckid, true, getCardsFromDeck(deckid))
    }

    const startingTown = findObjs({ type: 'card', deckid, name: 'Red Joker' })[0]
    drawCard(deckid, startingTown.id)
    const scard = new QuestCrawlCard({ x: 0, y: 0, cardid: startingTown.id })
    scard.place(true)

    const l = findObjs({ type: 'graphic', cardid: startingTown.id })[0]
    toFront(l)
    scard.id = l.id
    if (params.gaps) {
      gaps = parseInt(params.gaps, 10)
    }
    if (isNaN(gaps)) {
      gaps = Math.floor((global.rng() * 18) + 10)
    }
    const show = (parseInt(params.show, 10) === 1)

    sendChat('QuestCrawl', `island seed: ${state.QuestCrawl.config.seed} gaps: ${gaps}`)
    if (state.QuestCrawl.seedGenerated) {
      state.QuestCrawl.config.seed = null
    }
    const gapSplit = Math.round(54 / gaps)
    let i = 0
    while (global.placed.length < 54) {
      let target = global.grid.get(getRandomOpenCard().getRandomNeighborCoords())
      while (target.id) {
        if (global.open.length < 1) {
          sendError('Unable to Generate Island')
          return
        }
        target = global.grid.get(getRandomOpenCard().getRandomNeighborCoords())
      }
      if ((gaps !== 0) && (i % gapSplit === 0) && global.open.length >= 1) {
        const gap = new GapCard({ x: target.x, y: target.y })
        gap.place()
      } else {
        const cardid = drawCard(deckid)
        if (cardid === false || cardid.indexOf('-') !== 0) {
          break
        }
        const card = new QuestCrawlCard({ x: target.x, y: target.y, cardid })
        card.place(show)
        const l = findObjs({ type: 'graphic', cardid })[0]
        card.id = l.id
        toFront(l)
      }
      i++
    }
    global.grid.setup = false
    state.QuestCrawl.grid = global.grid.toJSON().map(c => c && c.toJSON())
  }

  global.toScreenGrid = toScreenGrid
  global.toScreenHex = toScreenHex
  global.getParams = getParams
  global.getNumericParams = getNumericParams
  global.onPartyMoved = onPartyMoved
  global.generateIsland = generateIsland
  global.init = init

  if (module) {
    module.exports = global
  }
})(global)
