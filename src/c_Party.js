(function ({
  GapCard,
  toScreenGrid,
  toScreenHex,
  getMoveHistory
}) {
  function PartyToken (token) {
    this.token = token
  }

  PartyToken.prototype = {
    hide: function () {
      this.token.set({
        layer: 'gmlayer'
      })
      return this
    },
    show: function () {
      this.token.set({
        layer: 'objects'
      })
      return this
    },
    set: function (...args) {
      this.token.set.apply(this.token, args)
      return this
    },
    get: function (key) {
      return this.token.get(key)
    },
    move: function (coord) {
      const card = new GapCard({ x: 0, y: 0 })
      const { mode } = state.QuestCrawl.config
      let screenPos = global.toScreenGrid(coord, card.cardSize)
      if (mode === 'hexagon') {
        screenPos = global.toScreenHex(coord, card.cardSize)
      }
      this.token.set(screenPos)
      return this
    }
  }
  // log('getCoreToken')
  function getCoreToken (name = 'Party') {
    const pageid = global.getPageId()
    const character = findObjs({ type: 'character', name })[0]
    const tokens = findObjs({ type: 'graphic', name, pageid })
    const result = tokens.length > 0
      ? tokens[0]
      : createObj('graphic', {
        name,
        imgsrc: global.getThumb(character.get('avatar')),
        height: 70,
        width: 70,
        pageid,
        layer: 'objects'
      })
    return new PartyToken(result)
  }

  // log('getPartyToken')
  function getPartyToken () {
    if (!PartyToken.Party) {
      PartyToken.Party = getCoreToken()
      const lastEntry = global.getMoveHistory().slice(-1)[0]
      PartyToken.Party.move(lastEntry)
    }
    return PartyToken.Party
  }

  // log('getFarseeingToken')
  function getFarseeingToken () {
    if (!PartyToken.Eye) {
      PartyToken.Eye = getCoreToken('Farseeing Eye')
      PartyToken.Eye.move({ x: 0, y: 0 })
    }
    return PartyToken.Eye
  }

  global.PartyToken = PartyToken
  global.getPartyToken = getPartyToken
  global.getFarseeingToken = getFarseeingToken

  if (module) {
    module.exports = global
  }
})(global)
