const global = {
  rng: Math.random,
  getAttrByName,
  getObj,
  randomInteger,
  on,
  sendChat,
  sendError,
  log,
  setAttrs,
  state,
  findObjs,
  filterObjs,
  _,
  createObj,
  Campaign,
  playCardToTable,
  cardInfo,
  recallCards,
  shuffleDeck,
  onSheetWorkerCompleted,
  drawCard,
  toFront,
  placed: [],
  open: [],
  grid: null,
  turnorder: null
}

if (global) {
  console.log('ready')
}
