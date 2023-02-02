(function ({
  getPartyToken,
  sendChat,
  getParty,
  getObj,
  getCharacterJSON,
  turnorder,
  state,
  getLastLogEntry,
  grid,
  getAttrByName,
  getEpitaph,
  logEvent,
  getCharacterHistory,
  addEpitaphDay,
  checkForHealingHerbs,
  checkForHolyRod,
  setAttrs,
  createObj,
  Campaign
}) {
  function TurnOrder (json = []) {
    this.internal = json
  }

  TurnOrder.prototype = {
    setTokenControl: function () {
      getPartyToken().set({
        controlledby: this.internal[0].playerid
      })
    },
    print: function () {
      sendChat('QuestCrawl', `Turn Order:<br/> ${this.getCharacters().map(({ initiative, name }, i) => `${i + 1}: ${name} [[${initiative}]]`).join('<br/>')}`)
    },
    nextTurn: function () {
      if (getParty().every(character => character.isDead())) {
        sendChat('QuestCrawl', 'Party is Dead. GAME OVER!')
        return false
      }
      this.internal.push(this.internal.shift())
      const next = this.internal[0]
      const player = getObj('player', next.playerid)
      if (getCharacterJSON(player).isDead()) {
        this.nextTurn()
      } else {
        this.setTokenControl()
      }
    },
    getCharacters: function () {
      return this.internal.map(({ playerid, result }) => Object.assign({ initiative: result }, getCharacterJSON(getObj('player', playerid))))
    },
    getCurrentCharacter: function () {
      const player = getObj('player', this.internal[0].playerid)
      return getCharacterJSON(player)
    },
    toJSON: function () {
      return this.internal
    },
    has: function (character) {
      return this.internal.find((turn) => turn.playerid === character.player.id)
    },
    add: function (character, result) {
      this.internal.push({ playerid: character.player.id, result })
      this.reset()
    },
    reset: function () {
      this.internal.sort((a, b) => b.result - a.result)
    },
    getTies: function () {
      return this.internal.filter(x => x).reduce((m, { result }) => {
        m[result] = m[result] || 0
        m[result]++
        return m
      }, {})
    },
    hasTies: function () {
      return Object.values(this.getTies()).some(count => count > 1)
    },
    removeTies: function () {
      const resultsToRemove = Object.entries(this.getTies()).filter(([result, count]) => count > 1).map(([result, count]) => result)
      const removedRolls = this.internal.filter(({ result }) => resultsToRemove.includes(result))
      removedRolls.forEach((toRemove) => {
        const { playerid, result } = toRemove
        const character = getCharacterJSON(getObj('player', playerid))
        sendChat('QuestCrawl', `/w ${character.who} You rolled a tie [[${result}]]. [Reroll Initiative]((!questcrawl --turnorder &#91;[1d6]&#93;))`)
        delete this.internal[this.internal.indexOf(toRemove)]
      })
    }
  }
  // log('endTurn')
  function endTurn (character) {
    if (turnorder.getCurrentCharacter().id !== character.id) {
      sendChat('QuestCrawl', `/w ${character.who} It isn't currently your turn. Only ${turnorder.getCurrentCharacter().name} may end the turn.`)
      return
    }
    state.QuestCrawl.day++
    getLastLogEntry().day = state.QuestCrawl.day
    state.QuestCrawl.grid = grid.toJSON().map(c => c && c.toJSON())
    getParty().forEach((character) => {
      if (getAttrByName(character.id, 'mode') === 'graveyard') {
        if ((getEpitaph(character) || []).length > 0) {
          return
        } else {
          const lastEntry = getLastLogEntry()
          lastEntry.day = state.QuestCrawl.day
          logEvent(character, 'Succumbed to their Injuries.')
          getCharacterHistory(character).forEach((l) => addEpitaphDay(character, l))
          return
        }
      }
      const output = {
        supplies: character.supplies,
        injuries: character.injuries,
        days: parseInt(character.days, 10)
      }
      if (character.supplies === 0 || character.supplies - (1 + character.injuries) < 0) {
        output.injuries += 1
      }
      output.supplies = Math.max(character.supplies - (1 + character.injuries), 0)
      output.days += 1
      if (output.injuries !== character.injuries) {
        sendChat('QuestCrawl', `${character.name} added ${output.injuries - character.injuries} Injuries from lack of Supplies.`)
      } else {
        sendChat('QuestCrawl', `${character.name} removed ${character.supplies - output.supplies} Supplies.`)
      }
      sendChat('QuestCrawl', `${character.name} has ${output.supplies} Supplies, ${output.injuries} Injuries, and ${character.treasure} Treasure.`)
      const commands = []
      checkForHealingHerbs(character, commands)
      checkForHolyRod(character, commands)
      commands.length > 0 && sendChat('QuestCrawl', `/w ${character.who} ${commands.join(' ')}`)
      setAttrs(character.id, output)
    })
    const deadCharacters = getParty().map(character => !character.isDead() && character.shouldDie() && character.die() && character.id).filter(x => x)
    if (deadCharacters.length === getParty().length) {
      sendChat('QuestCrawl', '<h1>The Party has died, GAME OVER!</h1>')
      return
    }
    updateTracker()
    turnorder.nextTurn()
    state.QuestCrawl.turnorder = turnorder.toJSON()
    sendChat('QuestCrawl', `Day ${state.QuestCrawl.day} is over. It is ${turnorder.getCurrentCharacter().name}'s turn.`)
    state.QuestCrawl.preventMove = null
  }
  // log('getOrCreateDayTracker')
  function getOrCreateDayTracker () {
    let tracker = getObj('text', state.QuestCrawl.trackerid)
    if (!tracker) {
      tracker = createObj('text', {
        left: 200,
        top: 150,
        width: 100,
        height: 100,
        font_size: 56,
        font_family: 'IM Fell DW Pica',
        layer: 'map',
        color: '#ffffff',
        pageid: Campaign().get('playerpageid')
      })
      state.QuestCrawl.trackerid = tracker.id
    }
    if (tracker.get('pageid') !== Campaign().get('playerpageid')) {
      tracker = createObj('text', {
        left: 200,
        top: 150,
        width: 100,
        height: 100,
        font_size: 56,
        font_family: 'IM Fell DW Pica',
        layer: 'map',
        color: '#ffffff',
        pageid: Campaign().get('playerpageid')
      })
      state.QuestCrawl.trackerid = tracker.id
    }
    return tracker
  }

  // log('updateTracker')
  function updateTracker () {
    const tracker = getOrCreateDayTracker()
    tracker.set('text', `Day: ${state.QuestCrawl.day}`)
  }

  global.TurnOrder = TurnOrder
  global.endTurn = endTurn
  global.updateTracker = updateTracker

  if (module) {
    module.exports = global
  }
})(global)
