(function ({
  getThumb,
  getCharacterItems,
  logEvent,
  getCharacterHistory,
  addEpitaphDay,
  game,
  getAttrByName,
  getObj,
  randomInteger,
  state,
  log,
  setAttrs,
  sendChat,
  findObjs,
  createObj,
  Campaign
}) {
  function Character (id, player) {
    this.id = id
    this.color = player.get('color')
    this._name = getAttrByName(id, 'character_name')
    this.name = `<span style='color: ${this.color};'>${this._name}</span>`
    this.suit1 = getAttrByName(id, 'first_suit')
    this.suit2 = getAttrByName(id, 'second_suit')
    this.quest = getAttrByName(id, 'quest')
    this.system = getObj('character', id)
    if (this.system) {
      this.avatar = this.system.get('avatar')
    }
    if (this.avatar) {
      this.thumb = getThumb(this.avatar)
    }
    this.itemIds = getCharacterItems(id)
    this.items = this.itemIds.map(x => x.name)
    this.days = getAttrByName(id, 'days')
    this.mode = getAttrByName(id, 'mode')
    this.treasure = parseInt(getAttrByName(id, 'treasure'), 10)
    this.treasure_max = parseInt(getAttrByName(id, 'max_treasure'), 10)
    this.injuries = parseInt(getAttrByName(id, 'injuries'), 10)
    this.injuries_max = parseInt(getAttrByName(id, 'max_injuries'), 10)
    this.supplies = parseInt(getAttrByName(id, 'supplies'), 10)
    this.supplies_max = parseInt(getAttrByName(id, 'max_supplies'), 10)
    this.inventory = parseInt(getAttrByName(id, 'inventory'), 10)
    this.inventory_max = parseInt(getAttrByName(id, 'max_inventory'), 10)
    this.player = player
    this.who = player.get('displayname')
  }

  Character.prototype = {
    getItemById: function (id) {
      return this.itemIds.find(item => item.id === id)
    },
    getItemByName: function (name) {
      return this.itemIds.find(item => item.name === name)
    },
    getRandomItem: function () {
      const index = randomInteger(this.items.length)
      return this.items[index - 1]
    },
    shouldDie: function () {
      return this.injuries >= this.injuries_max
    },
    isDead: function () {
      return this.mode === 'graveyard'
    },
    die: function () {
      log('character is dying')
      setAttrs(this.id, { mode: 'graveyard' })
      this.mode = 'graveyard'
      sendChat('QuestCrawl', `${this.name} has died.`)
      logEvent(this, 'Succumbed to their Injuries.')
      getCharacterHistory(this).forEach((l) => addEpitaphDay(this, l))
    },
    getToken: function () {
      let token = findObjs({ type: 'graphic', represents: this.id })[0]
      if (!token) {
        token = createObj('graphic', {
          pageid: Campaign().get('playerpageid'),
          top: 0,
          left: 0,
          represents: this.id,
          layer: 'objects',
          height: 70,
          width: 70,
          imgsrc: this.thumb || 'https://s3.amazonaws.com/files.d20.io/images/320602368/vZ9dXfIl0BUzNoXX9tI-ag/thumb.png?1672442009',
          controlledby: this.player.id
        })
      }
      return token
    }
  }
  // log('getCharacterId')
  function getCharacterId (player) {
    const { players } = state.QuestCrawl
    return players[player.id]
  }
  // log('getCharacterJSON')
  function getCharacterJSON (player) {
    const id = getCharacterId(player)
    const character = new Character(id, player)
    return character
  }

  global.getCharacterJSON = getCharacterJSON
  global.Character = Character
})(global)
