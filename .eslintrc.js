module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: 'standard',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
  },
  globals: {
    on: true,
    sendChat: true,
    log: true,
    setAttrs: true,
    state: true,
    getAttrByName: true,
    getObj: true,
    findObjs: true,
    randomInteger: true,
    filterObjs: true,
    _: true,
    createObj: true,
    Campaign: true,
    playCardToTable: true,
    cardInfo: true,
    recallCards: true,
    shuffleDeck: true,
    onSheetWorkerCompleted: true,
    drawCard: true,
    toFront: true
  }
}
