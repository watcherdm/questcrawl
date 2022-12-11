"use strict";

on("ready", () => {
    let rng = Math.random;    
    let cardSize = 70;
    let offset = 1085;
    const vOffset = 847;
    const hOffset = 864;
    
    const offsets = {
        x: 37.5,
        y: 67
    }

    const generateUUID = (() => {
        let a = 0;
        let b = [];
        return () => {
            let c = (new Date()).getTime() + 0;
            let f = 7;
            let e = new Array(8);
            let d = c === a;
            a = c;
            for (; 0 <= f; f--) {
                e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64);
                c = Math.floor(c / 64);
            }
            c = e.join("");
            if (d) {
                for (f = 11; 0 <= f && 63 === b[f]; f--) {
                    b[f] = 0;
                }
                b[f]++;
            } else {
                for (f = 0; 12 > f; f++) {
                    b[f] = Math.floor(64 * Math.random());
                }
            }
            for (f = 0; 12 > f; f++) {
                c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
            }
            return c;
        };
    })();
    
    const generateRowID = () => generateUUID().replace(/_/g, "-");

    function cyrb128(str) {
        let h1 = 1779033703, h2 = 3144134277,
            h3 = 1013904242, h4 = 2773480762;
        for (let i = 0, k; i < str.length; i++) {
            k = str.charCodeAt(i);
            h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
            h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
            h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
            h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
        }
        h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
        h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
        h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
        h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
        return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
    };
    
    function mulberry32(a) {
        return function() {
          var t = a += 0x6D2B79F5;
          t = Math.imul(t ^ t >>> 15, t | 1);
          t ^= t + Math.imul(t ^ t >>> 7, t | 61);
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    };
    
    function getParty() {
        const players = getOnlinePlayers()
        return players.map(p => getCharacterJSON(p))
    }
    
    const commands = {
        'Ace of Hearts': (card) => {
            return `[Climb the Mountain](!questcrawl --climb)`;
        },
        'Ace of Diamonds': (card) => {
            return `[Climb the Mountain](!questcrawl --climb)`;
        },
        'Ace of Clubs': (card) => {
            return `[Climb the Mountain](!questcrawl --climb)`;
        },
        'Ace of Spades': (card) => {
            return `[Climb the Mountain](!questcrawl --climb)`;
        },
        'Two of Hearts': (card) => {
            return `[Forage for Supplies](!questcrawl --forage --suit hearts --challenge 2)`;
        },
        'Two of Diamonds': (card) => {
            return `[Forage for Supplies](!questcrawl --forage --suit diamonds --challenge 2)`;
        },
        'Two of Clubs': (card) => {
            return `[Forage for Supplies](!questcrawl --forage --suit clubs --challenge 2)`;
        },
        'Two of Spades': (card) => {
            return `[Forage for Supplies](!questcrawl --forage --suit spades --challenge 2)`;
        },
        'Three of Hearts': (card) => {
            return `[Slay the Beastie](!questcrawl --beastie --suit hearts --challenge 3)`;
        },
        'Three of Diamonds': (card) => {
            return `[Slay the Beastie](!questcrawl --beastie --suit diamonds --challenge 3)`;
        },
        'Three of Clubs': (card) => {
            return `[Slay the Beastie](!questcrawl --beastie --suit clubs --challenge 3)`;
        },
        'Three of Spades': (card) => {
            return `[Slay the Beastie](!questcrawl --beastie --suit spades --challenge 3)`;
        },
        'Four of Hearts': (card) => {
            return `[Slay the Beastie](!questcrawl --beastie --suit hearts --challenge 4)`;
        },
        'Four of Diamonds': (card) => {
            return `[Slay the Beastie](!questcrawl --beastie --suit diamonds --challenge 4)`;
        },
        'Four of Clubs': (card) => {
            return `[Slay the Beastie](!questcrawl --beastie --suit clubs --challenge 4)`;
        },
        'Four of Spades': (card) => {
            return `[Slay the Beastie](!questcrawl --beastie --suit spades --challenge 4)`;
        },
        'Five of Hearts': (card) => {
            return `[Slay the Beastie](!questcrawl --beastie --suit hearts --challenge 5)`;
        },
        'Five of Diamonds': (card) => {
            return `[Slay the Beastie](!questcrawl --beastie --suit diamonds --challenge 5)`;
        },
        'Five of Clubs': (card) => {
            return `[Slay the Beastie](!questcrawl --beastie --suit clubs --challenge 5)`;
        },
        'Five of Spades': (card) => {
            return `[Slay the Beastie](!questcrawl --beastie --suit spades --challenge 5)`;
        },
        'Six of Hearts': (card) => {
            return `[Forage for Supplies](!questcrawl --forage --suit hearts --challenge 6)`;
        },
        'Six of Diamonds': (card) => {
            return `[Forage for Supplies](!questcrawl --forage --suit diamonds --challenge 6)`;
        },
        'Six of Clubs': (card) => {
            return `[Forage for Supplies](!questcrawl --forage --suit clubs --challenge 6)`;
        },
        'Six of Spades': (card) => {
            return `[Forage for Supplies](!questcrawl --forage --suit spades --challenge 6)`;
        },
        'Seven of Hearts': (card) => {
            return `[Guide the Party](!questcrawl --hardlands --suit hearts --challenge 7)`;
        },
        'Seven of Diamonds': (card) => {
            return `[Guide the Party](!questcrawl --hardlands --suit diamonds --challenge 7)`;
        },
        'Seven of Clubs': (card) => {
            return `[Guide the Party](!questcrawl --hardlands --suit clubs --challenge 7)`;
        },
        'Seven of Spades': (card) => {
            return `[Guide the Party](!questcrawl --hardlands --suit spades --challenge 7)`;
        },
        'Eight of Hearts': (card) => {
            return `[Guide the Party](!questcrawl --hardlands --suit hearts --challenge 8)`;
        },
        'Eight of Diamonds': (card) => {
            return `[Guide the Party](!questcrawl --hardlands --suit diamonds --challenge 8)`;
        },
        'Eight of Clubs': (card) => {
            return `[Guide the Party](!questcrawl --hardlands --suit clubs --challenge 8)`;
        },
        'Eight of Spades': (card) => {
            return `[Guide the Party](!questcrawl --hardlands --suit spades --challenge 8)`;
        },
        'Nine of Hearts': (card) => {
            return `[Guide the Party](!questcrawl --crisis --suit hearts --challenge 9)`;
        },
        'Nine of Diamonds': (card) => {
            return `[Guide the Party](!questcrawl --crisis --suit diamonds --challenge 9)`;
        },
        'Nine of Clubs': (card) => {
            return `[Guide the Party](!questcrawl --crisis --suit clubs --challenge 9)`;
        },
        'Nine of Spades': (card) => {
            return `[Guide the Party](!questcrawl --crisis --suit spades --challenge 9)`;
        },
        'Ten of Hearts': (card) => {
            return `[Evade the Megabeast](!questcrawl --megabeast --suit hearts --challenge 10)`;
        },
        'Ten of Diamonds': (card) => {
            return `[Evade the Megabeast](!questcrawl --megabeast --suit diamonds --challenge 9)`;
        },
        'Ten of Clubs': (card) => {
            return `[Evade the Megabeast](!questcrawl --megabeast --suit clubs --challenge 9)`;
        },
        'Ten of Spades': (card) => {
            return `[Evade the Megabeast](!questcrawl --megabeast --suit spades --challenge 9)`;
        },
        'Jack of Hearts': (card) => {
            return `[Collect 20 Supplies](!questcrawl --buy --item 21 --cost 0)`;
        },
        'Jack of Diamonds': (card) => {
            return `[Investigate the Vault](!questcrawl --vault)`;
        },
        'Jack of Clubs': (card) => {
            return `
                [Farseeing: 1 Treasure](!questcrawl --map 3) 
                [Heal the Party: 3 Treasure](!questcrawl --heal 0 --cost 3)`;
        },
        'Jack of Spades': (card) => {
            return `
                [Activate Counter-Clockwise](!questcrawl --twist cc --x ${card.x} --y ${card.y}) 
                [Activate Clockwise](!questcrawl --twist c --x ${card.x} --y ${card.y})`
        },
        'Red Joker': (card) => {
            return `[Shop](!questcrawl --shop) [Heal 3 Injuries: 1 Treasure](!questcrawl --heal 3 --cost 1)`
        },
        'Black Joker': (card) => {
            if ((state.QuestCrawl.factions || {}).city_of_thieves === 2) {
                return `[Shop](!questcrawl --shop) [Heal 3 Injuries: 1 Treasure](!questcrawl --heal 3 --cost 1)`
            } else {
                return `<h4>I Cannot Trade with you While Those Thieves Remain Active</h4>`
            }
        },
        'King of Hearts': (card) => {
            const comms = []
            if ((state.QuestCrawl.factions || {}).dwarves === 1) {
                comms.push('[Continue Fighting the Dwarves](!questcrawl --beastie --suit hearts --challenge 8 --type faction)')
            } else {
                comms.push('[Fight the Dwarves](!questcrawl --beastie --suit hearts --challenge 8 --type faction)')
                comms.push('[Buy 1 Enchanted Shield: 3 Treasure](!questcrawl --buy --item 9)')
                if ((state.QuestCrawl.artifacts || {}).dwarven_tunnel_passport) {
                    comms.push('[Take the Tunnels: Use Passport!](!questcrawl --tunnel)')
                } else if ((state.QuestCrawl.factions || {}).elves === 2) {
                    comms.push('[Claim Dwarven Tunnel Passport](!questcrawl --claimartifact 3)')
                } else {
                    comms.push('[Take the Tunnels: 1 Treasure](!questcrawl --tunnel)')
                }
            }
            return comms.join('\n')
        },
        'King of Diamonds': (card) => {
            // setup traps around here
            const comms = []
            if ((state.QuestCrawl.factions || {}).city_of_thieves === 1) {
                comms.push('[Continue Fighting the City of Thieves](!questcrawl --beasite --suit diamonds --challenge 8 --type faction)')
            } else {
                comms.push('[Fight the City of Thieves](!questcrawl --beasite --suit diamonds --challenge 8 --type faction)')
                comms.push('[Shop Magic Items](!questcrawl --shop --type magic)')
                if (!(state.QuestCrawl.artifacts || {}).pocket_pirate_ship) {
                    comms.push('[Buy Pocket Pirate Ship: 9 Treasure](!questcrawl --claimartifact 4)')
                }
            }
            return comms.join('\n')
        },
        'King of Clubs': (card) => {
            const comms = []
            if ((state.QuestCrawl.factions || {}).elves === 1) {
                comms.push('[Continue Fighting the Elves](!questcrawl --beastie --suit clubs --challenge 8 --type faction)')
            } else {
                comms.push('[Fight the Elves](!questcrawl  --beastie --suit clubs --challenge 8 --type faction)')
                comms.push('[Buy 12 Supplies: 1 Treasure](!questcrawl --buy --item 20 --cost 1)')
                comms.push('[Buy 1 Elven Cloak: 3 Treasure](!questcrawl --buy --item 10 --cost 3)')
                if ((state.QuestCrawl.factions || {}).dwarves === 2 && !(state.QuestCrawl.artifacts || {}).ancient_knowledge) {
                    comms.push('[Claim Ancient Knowledge](!questcrawl --claimartifact ancient_knowledge)')
                }
            }
            return comms.join('\n')
        },
        'King of Spades': (card) => {
            // setup traps around here
            const comms = []
            const {evil} = state.QuestCrawl
            if ((state.QuestCrawl.factions || {}).unearthed_evil === 2) {
            
                
            } if ((state.QuestCrawl.factions || {}).unearthed_evil === 1) {
                comms.push(`[Continue Fighting the Unearthed Evil](!questcrawl --beastie --suit spades --challenge ${12 - (evil || 0)} --type faction)`)
            } else {
                comms.push(`[Fight the Unearthed Evil](!questcrawl --beastie --suit spades --challenge ${12 - (evil || 0)} --type faction)`)
            }
            return comms.join('\n')
        }

    }

    const NEW = 0
    const START = 1
    const PLAY = 2
    const MAP = 3
    const CHAMP = 4

    function resetConfig() {
        log('resetting configuration')
        if (!state.QuestCrawl) {
            state.QuestCrawl = {
                version: 2.1,
                config: {
                    mode: 'original'
                },
                currentState: 0,
                currentChampion: null,
                grid: [],
                day: 0,
                players: {},
                characters: [],
                count: 0,
                factions: {},
                history: []
            }
        }
        if (Array.isArray(state.QuestCrawl.players)) {
            state.QuestCrawl.players = {};
        }
        if (!state.QuestCrawl.factions) {
            state.QuestCrawl.factions = {};
        }
        if (!state.QuestCrawl.history) {
            state.QuestCrawl.history.push(coord) = [];
        }
        state.QuestCrawl.currentChampion = null;
    }

    resetConfig()
    
    function resetRng() {
        if (state.QuestCrawl.config.seed) {
            log(`setting rng to mulberry with seed ${state.QuestCrawl.config.seed}`)
            const seed = cyrb128(state.QuestCrawl.config.seed)
            rng = mulberry32(seed[0])
        } else {
            const kernel = generateUUID()
            const seed = cyrb128(kernel)
            rng = mulberry32(seed[0])
            log(`seed: ${seed[0]}:${kernel}`)
        }
    }

    function endTurn() {
        Object.keys(state.QuestCrawl.players).forEach((player) => {
            const character = getCharacterJSON({id: player})
            log(character)
            const supplies = findObjs({ type: 'attribute', characterid: character.id, name: 'supplies' })[0];
            const injuries = findObjs({ type: 'attribute', characterid: character.id, name: 'injuries' })[0];
            if ((character.supplies - (1 + character.injuries)) > 0) {
                log(supplies)
                supplies.setWithWorker({
                    current: character.supplies - (1 + character.injuries)
                });
            } else {
                supplies.setWithWorker({
                    current: 0
                });
                injuries.setWithWorker({
                    current: character.injuries + 1
                });
            }
        });
        sendChat('QuestCrawl', `<h1>Day ${state.QuestCrawl.day} is over, supplies have been removed.</h1>`)
        state.QuestCrawl.day += 1;
        state.QuestCrawl.grid = grid.toJSON();
        updateTracker();
    }

    function updateTracker() {
        const tracker = getObj('text', state.QuestCrawl.trackerid);
        tracker.set('text', `Day: ${state.QuestCrawl.day}`);
    }

    const processInlinerolls = (msg) => {
        if(_.has(msg,'inlinerolls')){
            return _.chain(msg.inlinerolls)
                .reduce(function(m,v,k){
                    let ti=_.reduce(v.results.rolls,function(m2,v2){
                        if(_.has(v2,'table')){
                            m2.push(_.reduce(v2.results,function(m3,v3){
                                m3.push(v3.tableItem.name);
                                return m3;
                            },[]).join(', '));
                        }
                        return m2;
                    },[]).join(', ');
                    m['$[['+k+']]']= (ti.length && ti) || v.results.total || 0;
                    return m;
                },{})
                .reduce(function(m,v,k){
                    return m.replace(k,v);
                },msg.content)
                .value();
        } else {
            return msg.content;
        }
    };
    
    function getOrCreateDayTracker() {
        log('adding day tracker object')
        let tracker = getObj('text', state.QuestCrawl.trackerid);
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
            });
            state.QuestCrawl.trackerid = tracker.id;
        }
        updateTracker();
    }

        
    getOrCreateDayTracker()

    const showHelp = () => {
        log("we could all certainly use a little help!")
    }

    const sendError = (who, msg) => sendChat('QuestCrawl',`/w "${who}" ${msg}`);

    function QuestCrawlCard({x, y, id, cardid, faceup, blank = false}) {
        const {mode} = state.QuestCrawl.config;
        this.x = x
        this.y = y
        this.id = id
        this.cardid = cardid
        this.faceup = faceup
        this.blank = blank


        if (mode === 'original') {
            this.neighbors = [
                {x:-1,y:-1},{x:0,y:-1},{x:1,y:-1},
                {x:-1,y:0},{x: 1, y: 0},
                {x:-1,y:1},{x: 0, y: 1},{x:1,y:1}
            ];
            this.cardSize = 70;
        } else if (mode === 'hexagon') {
            this.neighbors = [
                {x: -.5, y: -1},
                {x: .5, y: -1},
                {x: -1, y: 0},
                {x: 1, y: 0},
                {x: -.5, y: 1},
                {x: .5, y: 1}
            ];
            this.cardSize = {
                w: 75,
                h: 88
            }
        }
    }
    
    function GapCard({x, y}) {
        this.x = x
        this.y = y
        this.id = 'Gap'
        this.cardid = 'Lake'
    }

    GapCard.prototype = {
        getCoordString: function(){return `${this.x.toFixed(1)},${this.y.toFixed(1)}`},
        toJSON: function() {
            return {
                x: this.x,
                y: this.y,
                cardid: this.cardid,
                id: this.id,
                faceup: this.faceup
            }
        },
        place: function(){
            grid.put(this)
        }
    }
    
    QuestCrawlCard.prototype = {
        getCoordString: function(){return `${this.x.toFixed(1)},${this.y.toFixed(1)}`},
        getRandomNeighbor: function(){
            let {x, y} = this;
            const n = this.neighbors[Math.floor(rng() * (this.neighbors.length - 1))];
            x += n.x
            y += n.y
            const openSlots = this.neighbors.some((n) => {
                return !grid.get({x: this.x + n.x, y: this.y + n.y}).id
            })
            if (!openSlots) {
                open.splice(open.indexOf(this), 1)
            }
            return {x, y}
        },
        getAllNeighbors: function() {
            let {x, y} = this;
            return this.neighbors.map((n) => {
                return {x: x + n.x, y: y + n.y}
            });
        },
        place: function(faceup = false){
            const {mode} = state.QuestCrawl.config;
            if (faceup) {
                this.faceup = faceup
            }
            if (mode === 'original') {
                playCardToTable(this.cardid, {
                    left: offset + (this.x * this.cardSize),
                    top: offset + (this.y * this.cardSize),
                    layer: 'map',
                    currentSide: this.faceup ? 0 : 1
                });
            } else if (mode === 'hexagon') {
                playCardToTable(this.cardid, {
                    left: hOffset + (this.x * this.cardSize.w),
                    top: vOffset + (this.y * offsets.y),
                    layer: 'map',
                    currentSide: this.faceup ? 0 : 1
                });
            } else {
                throw new Error(`Invalid mode unknown: ${mode}`)
            }
            grid.put(this)
            if (placed.indexOf(this) === -1) {
                placed.push(this)
            }
            if (open.indexOf(this) === -1) {
                open.push(this)
            }
        },
        toJSON: function() {
            return {
                x: this.x,
                y: this.y,
                cardid: this.cardid,
                id: this.id,
                faceup: this.faceup
            }
        },
        makeBlank: function() {
            this.blank = true;
        }
    }

    function Grid() {
        this.internal = {}
    }
    
    Grid.prototype = {
        get: function({x, y}) {
            return this.internal[`${x.toFixed(1)},${y.toFixed(1)}`] || {x,y};
        },
        put: function(card) {
            this.internal[card.getCoordString()] = card;
        },
        toJSON: function() {
            return Object.values(this.internal)
        },
        move: function(card, coords) {
            if (this.internal[card.getCoordString()] === card) {
                delete this.internal[card.getCoordString()]
            }
            card.x = coords.x
            card.y = coords.y
            this.put(card)
        }
    }

    Grid.fromJSON = function(data) {
        if (!Array.isArray(data)) {
            return new Grid();
        }
        return data.reduce((g, card) => {
            if (card.cardid === "Lake") {
                g.put(new GapCard(card))
            } else {
                g.put(new QuestCrawlCard(card))
            }
            return g
        }, (new Grid()));
    }

    let placed = []
    let open = []
    let grid;
    if (state.QuestCrawl.grid) {
        log('loading grid from json')
        grid = Grid.fromJSON(state.QuestCrawl.grid)
    } else {
        log('creating new empty grid')
        grid = new Grid()
    }

    function getPartyToken() {
        return getObj('graphic', state.QuestCrawl.tokenid)
    }


    function getRandomOpenCard() {
        return open[Math.floor(rng() * (open.length - 1))];
    }

    function toCoords(left, top) {
        const {mode} = state.QuestCrawl.config;
        if (mode === 'original') {
            return {x: (left - offset) / cardSize , y: (top - offset) / cardSize}
        } else if (mode === 'hexagon') {
            cardSize = {
                w: 75,
                h: 88
            };
            const x = parseFloat(((left - hOffset) / cardSize.w).toFixed(1), 10);
            const y = parseFloat(((top - vOffset) / offsets.y).toFixed(1));
            return { x , y }
        }
    }

    function detectGameState() {
        log('attempting to read state from board')
        if (!state.QuestCrawl.config.deck) {
            sendChat('QuestCrawl', 'Unable to detect running game state, invalid configuration')
            return
        }
        const currentDeck = findObjs({type: 'deck', name: state.QuestCrawl.config.deck})[0]
        const deckid = currentDeck.id
        const ci = cardInfo({type: 'graphic', deckid })
        
        ci.forEach((c) => {
            const gra = getObj('graphic', c.id)
            const left = gra.get('left')
            const top = gra.get('top')
            const currentSide = gra.get('currentSide')
            const {x,y} = toCoords(left, top)
            const card = new QuestCrawlCard({x: 0+ x, y : 0 + y, id: c.id, cardid: c.cardid, faceup: currentSide === 0 })
            grid.put(card)
        })
    }

    function getCharacterId(player) {
        const {players} = state.QuestCrawl;
        return players[player.id]
    }

    function getCharacterItems(characterId) {
        return filterObjs(function(obj) {
            if(obj.get("type") === 'attribute' && obj.get('characterid') === characterId &&
                 obj.get('name').indexOf('repeating_inventory') > -1 && obj.get('name').indexOf('_name') > -1) return true;
            else return false;
        }).map(w => w.get('current'));
    }

    function getCardsFromDeck(deckid) {
        return findObjs({type: 'card', deckid}).sort((a, b) => {
            const aname = a.get('name');
            const bname = b.get('name');
            if (aname > bname) {
                return 1
            } else if (bname > aname) {
                return -1
            } else {
                return 0
            }
        }).sort(() => {
            return Math.floor(rng() * 2) - 1
        }).map(x => x.id);
    }

    function getCharacterJSON(player) {
        const id = getCharacterId(player)
        const items = getCharacterItems(id)
        const suit1 = getAttrByName(id, 'first_suit')
        const suit2 = getAttrByName(id, 'second_suit')
        const name = getAttrByName(id, 'character_name')
        const treasure = parseInt(getAttrByName(id, 'treasure'), 10)
        const treasure_max = parseInt(getAttrByName(id, 'max_treasure'), 10)
        const injuries = parseInt(getAttrByName(id, 'injuries'), 10)
        const injuries_max = parseInt(getAttrByName(id, 'max_injuries'), 10)
        const supplies = parseInt(getAttrByName(id, 'supplies'), 10)
        const supplies_max = parseInt(getAttrByName(id, 'max_supplies'), 10)
        const inventory = parseInt(getAttrByName(id, 'inventory'), 10)
        const inventory_max = parseInt(getAttrByName(id, 'max_inventory'), 10)

        return {
            id,
            items,
            suit1,
            suit2,
            name,
            treasure,
            treasure_max,
            injuries,
            injuries_max,
            supplies,
            supplies_max,
            inventory,
            inventory_max
        }
    }

    const magicItems = [
        {
            id: 8,
            name: "Magic Sword"
        },
        {
            id: 9,
            name: "Enchanted Shield"
        },
        {
            id: 10,
            name: "Elven Cloak"
        },
        {
            id: 11,
            name: "Bottomless Bag"
        },
        {
            id: 12,
            name: "Book of Spells"
        },
        {
            id: 13,
            name: "Holy Rod"
        }

    ]


    const items = {
        "supplies": {
            img: "",
            name: '10 Supplies',
            description: 'Used to survive from day to day'
        },
        "compass": {
            img: "https://questcrawl.com/wp-content/uploads/2022/08/watcherdm_fantasy_compass_on_a_wooden_table_torche_lit_and_glea_aa851deb-9d34-42dc-b8ae-97831b480c0c.png",
            name: "Compass",
            description: "Bonus on Hard Lands. A lifesaver for small Parties."
        },
        "mountaineering-gear": {
            img: "https://questcrawl.com/wp-content/uploads/2022/08/watcherdm_mountaineering_gear_dwarf_made._75336b64-0b69-43db-8913-5a8cde6a3afb.png",
            name: "Mountaineering Gear",
            description: "Bonus on Mountains."
        },
        "survival-kit": {
            img: "https://questcrawl.com/wp-content/uploads/2022/08/watcherdm_survival_kit_fantasy_39a9ab0f-666b-494d-95d1-214facd45f85.png",
            name: "Survival Kit",
            description: "Bonus on Crises."
        },
        "map": {
            img: "https://questcrawl.com/wp-content/uploads/2022/08/watcherdm_treasure_map_on_parchment_f58680e5-7efd-414c-883f-553bf2d05a15.png",
            name: "Map",
            description: "Discard to roll a die. Flip that many distant Territories that are connected."
        },
        "healing-herb": {
            img: "https://questcrawl.com/wp-content/uploads/2022/08/watcherdm_healing_herbs_bundle_7158ff24-d8b8-41ea-b7cd-58b9523cd9c6.png",
            name: "Healing Herbs",
            description: "Discard to remove 1 Injury."
        },
        "rabbits-foot": {
            img: "https://questcrawl.com/wp-content/uploads/2022/08/watcherdm_rabbit_foot_amulet_5e2e7cbb-a57b-49c6-a812-29481ecbc7f5.png",
            name: "Rabbit's Foot",
            description: "Discard to reroll a die."
        },
        "magic-sword": {
            img: "https://questcrawl.com/wp-content/uploads/2022/08/watcherdm_a_magical_long_sword_91157dc7-9259-4aaa-a148-7d5e33e20eb5.png",
            name: "Magic Sword",
            description: "Bonus against Terrible Beasties and Factions. Name your blade!"
        },
        "enchanted-shield": {
            img: "https://questcrawl.com/wp-content/uploads/2022/08/watcherdm_enchanted_shield_b6acd85e-6f61-4d9d-9b8b-97eda4635d51.png",
            name: "Enchanted Shield",
            description: "When adding Injuries from Terrible Beasties, Megabeasts, or Factions, roll a die. On a 4, 5, or 6, prevent 1 Injury."
        },
        "elven-cloak": {
            img: "https://questcrawl.com/wp-content/uploads/2022/08/watcherdm_elven_cloak_da20729f-0d43-41b2-8a00-92760b36e2e9.png",
            name: "Elven Cloak",
            description: "Bonus against Megabeasts."
        },
        "bottomless-bag": {
            img: "https://questcrawl.com/wp-content/uploads/2022/08/watcherdm_bottomless_bag_magical_bag_of_holding_402157bb-adfe-489b-861e-7fe2febfecd8.png",
            name: "Bottomless Bag",
            description: "Character has nine Inventory Slots and can carry up to 9 Treasures and 30 Supplies."
        },
        "book-of-spells": {
            img: "https://questcrawl.com/wp-content/uploads/2022/08/watcherdm_spellbook_0d1e3e19-9094-47e1-9a41-155c6216e698.png",
            name: "Book of Spells",
            description: "Add 1 Injury to give another Character a Bonus. Use this before they roll, once per turn. Describe your spell."
        },
        "holy-rod": {
            img: "https://questcrawl.com/wp-content/uploads/2022/08/watcherdm_holy_rod_66c3df33-5404-41ea-a162-58e5b0662d0a.png",
            name: "Holy Rod",
            description: "Bonus on any Territory connected to a Quest. Add 1 Injury to remove 1 Injury from another Character."
        },
        "dwarven-tunnel-passport": {
            img: "https://questcrawl.com/wp-content/uploads/2022/11/watcherdm_dwarven_tunnel_passport_183f402e-c33f-4d7f-a82f-600979e84d61.png",
            name: "Dwarven Tunnel Passport",
            description: "The Party may move from Mountain to Mountain across any distance."
        },
        "ancient-knowledge": {
            img: "https://questcrawl.com/wp-content/uploads/2022/08/watcherdm_ancient_knowledge_of_the_elves_001c78f5-1b1b-40bf-98b0-2a54bce1cc28.png",
            name: "Ancient Knowledge",
            description: "The Party gains a Bonus on Good Lands; rolling doubles on Good Lands finds Healing Herbs."
        },
        "weapon-of-legend": {
            img: "https://questcrawl.com/wp-content/uploads/2022/08/watcherdm_weapon_of_legend_e4a44098-28c3-4587-90dd-25e82ca24ff1.png",
            name: "Weapon of Legend",
            description: "Bonus against Terrible Beasties, Factions, and the End Beast."
        },
        "vault-key": {
            img: "https://questcrawl.com/wp-content/uploads/2022/11/watcherdm_vault_key_b0d4749e-23d9-4c49-98bb-8b021a6e1caa.png",
            name: "Vault Key",
            description: "Opens the Vault."
        },
        "orb-of-chaos": {
            img: "https://questcrawl.com/wp-content/uploads/2022/08/watcherdm_orb_ofchaos_2aa03cf6-55e7-4502-a6f5-1f442aa0faf8.png",
            name: "Orb of Chaos",
            description: "Discard to shuffle and redeal the whole Island."
        },
        "pocket-pirate-ship": {
            img: "https://questcrawl.com/wp-content/uploads/2022/08/watcherdm_a_pirate_ship_sailing_in_a_storm_inside_a_windowed_fl_e33511a9-541e-436f-9b46-a1f934059b2b.png",
            name: "Pocket Pirate Ship",
            description: "The Party may skip across one-card gaps in the Island while moving."
        },
        "elf_supplies": {
            img: "",
            name: '12 Supplies',
            description: 'Used to survive from day to day'
        },
        "garden_of_plenty": {
            img: "",
            name: '20 Supplies',
            description: 'Used to survive from day to day'
        }
    }

    
    const factions = {
        initiate: {
            hearts: () => {
                state.QuestCrawl.factions.dwarves = 1
            },
            diamonds: () => {
                state.QuestCrawl.factions.city_of_thieves = 1
            },
            clubs: () => {
                state.QuestCrawl.factions.elves = 1
            },
            spades: () => {
                state.QuestCrawl.factions.unearthed_evil = 1
            }
        },
        defeat: {
            hearts: () => {
                state.QuestCrawl.factions.dwarves = 2
            },
            diamonds: () => {
                state.QuestCrawl.factions.city_of_thieves = 2
            },
            clubs: () => {
                state.QuestCrawl.factions.elves = 2
            },
            spades: () => {
                state.QuestCrawl.factions.unearthed_evil = 2
            }
        }
    }

    function getChallengeCommandArgs(challenge, params, dice) {
        return `(!questcrawl --${challenge} --suit ${params.suit} --challenge ${params.challenge} --result ${dice.map(d => `&#91;[${d}]&#93;`).join("|")} --source ${params.source.join('|')})`
    }

    function getBeastieCommandArgs(params, dice) {
        return getChallengeCommandArgs('beastie', params, dice);
    }

    function parseOutcome(params) {
        const source = params.source.split('|')
        return params.result.split('|').map(x => parseInt(x, 10)).reduce((m, r, i) => {
            m.result += r;
            m.vals[r] = m.vals[r] || 0
            m.vals[r]++;
            if (r === 1) {
                m.b.push(source[i])
            }
            return m;
        }, {result: 0, b: [], vals: {}})
    }

    function getOnlinePlayers() {
        const players = findObjs({type: 'player'})
        return players.filter(p => p.get('online'))
    }

    function getParams(args, offset) {
        return args.slice(offset).reduce((m, x) => {
            const [key, value] = x.split(' ')
            m[key] = value;
            return m;
        }, {})
    }

    function getNumericParams(args, offset) {
        return args.slice(offset).reduce((m, x) => {
            const [key, value] = x.split(' ')
            m[key] = parseInt(value, 10);
            return m;
        }, {})
    }

    function getCommand(name, card) {
        if ((state.QuestCrawl.config || {}).commands) {
            if (commands[name]) return commands[name](card)
        }
        return ''
    }

    function onPartyMoved(grid, obj) {
        state.QuestCrawl.tokenid = obj.id
        const left = parseInt(obj.get("left"), 10)
        const top = parseInt(obj.get("top"), 10)
        log({id: obj.id, top, left})
        const coord = toCoords(left, top)
        log(coord)
        const card = grid.get(coord)
        if (!card.cardid) {
            return
        }
        if (!card.faceup) {
            card.faceup = true
            const gra = getObj('graphic', card.id)
            if (!gra) {
                return
            }
            gra.set({
                currentSide: 0,
                imgsrc: decodeURIComponent(gra.get('sides').split('|')[0].replace('med.png', 'thumb.png'))
            })
        }
        const data = getObj('card', card.cardid)
        let name = data.get('name')
        if (card.blank) {
            sendChat('QuestCrawl', 'Random Encounter!')
            const randomEncounter = randomInteger(6)
            if (randomEncounter < 4) {
                name = name.replace(/^\w+(\sof\s\w+)/, 'Two$1')
            } else if (randomEncounter < 6) {
                name = name.replace(/^\w+(\sof\s\w+)/, 'Five$1')
            } else {
                name = name.replace(/^\w+(\sof\s\w+)/, 'Nine$1')
            }
        }
        const handout = findObjs({type: 'handout', name: name})[0]
        handout.get("notes", (note) => {
            sendChat('QuestCrawl',`<div>
                <img src="${handout.get('avatar')}"/>
                <h5>${data.get('name')}</h5>
                <p>${note}<p>
                <p>${getCommand(data.get('name'), card)}</p>
            </div>`);
        })
        state.QuestCrawl.history.push(coord)
        state.QuestCrawl.currentMagicItem = null;
    }

    function onFarseeingEyeMoved(grid, obj) {
        log(obj)
    }

    function whisperCharacter(player, who, args) {
        const character = getCharacterJSON(player)
        sendChat('QuestCrawl', `/w ${who} You are playing: <b>[${character.name}](http://journal.roll20.net/character/${character.id})</b>`)
    }

    function confirmCharacter(player, who, args) {
        const {players} = state.QuestCrawl
        const params = getParams(args, 2)
        players[params.player] = params.character
        whisperCharacter(player, who, args)
    }

    function configure(who, args) {
        const params = getParams(args, 2)
        if (Object.keys(params).length === 0) {
            const co = {...state.QuestCrawl}
            delete co.grid
            sendChat('QuestCrawl', `/w ${who} ${JSON.stringify(co, null, 2)}`)
            return
        }
        if (params.reset) {
            sendError(who, `Resetting Mod to Factory Default`)
            delete state.QuestCrawl
            resetConfig()
            return
        }
        log(`setting configuration`)
        log(params)
        state.QuestCrawl.config = Object.assign(state.QuestCrawl.config, params);
        return;
    }

    function resetBoard(deckid) {
        setTimeout(() => {
            recallCards(deckid)
            setTimeout(() => {
                shuffleDeck(deckid)
                setTimeout(() => {
                    recallCards(deckid)
                    setTimeout(() => {
                        shuffleDeck(deckid)
                        log("cards reset")
                        grid = new Grid()
                        placed = []
                        open = []
                        state.QuestCrawl.day = 0;
                        state.QuestCrawl.evil = 0;
                        state.QuestCrawl.currentChampion = 0;
                        updateTracker()
                    }, 100)
                }, 100)
            }, 100)
        }, 100)
    }

    function forageResult(character, who, params) {
        const outcome = parseOutcome(params)
        const {result} = outcome
        if (result >= parseInt(params.challenge, 10)) {
            sendChat('QuestCrawl', `/w ${who} You rolled [[${result}]] and were able to successfully forage ${result} supplies today!`)
            setAttrs(character.id, {
                supplies: Math.min(character.supplies_max, character.supplies + result)
            });
        } else {
            sendChat('QuestCrawl', `/w ${who} You rolled [[${result}]] and failed to collect any supplies today.`)
        }
        if (params.source.indexOf('ancient-knowledge') !== -1 && Object.values(outcome.vals).some(x => x > 1)) {
            sendChat('QuestCrawl', `/w ${who} The secrets of the Elves has lead you to discover Healing Herbs here. [Collect Healing Herbs](!questcrawl --buy --item 6 --cost 0)`)
        }
    }

    function forage(character, who, args) {
        const params = getParams(args, 2)
        if (params.result) {
            return forageResult(character, who, params)
        }
        params.source = ['hero']
        const dice = ['1d6']
        let label = 'Regular Foraging'
        if ([character.suit1, character.suit2].indexOf(params.suit) !== -1) {
            params.source.push('suit')
            dice.push('1d6')
            label += ' (with Suit Bonus)'
        }
        if ((state.QuestCrawl.artifacts || {}).ancient_knowledge) {
            params.source.push('ancient-knowledge')
            dice.push('1d6')
            label += ', with Ancient Knowledge'
        }
        sendChat('QuestCrawl', `/w ${who} [${label} ${dice.length}d6]${getChallengeCommandArgs('forage', params, dice)}`)
    }

    function loot(character, who, args) {
        const val = parseInt(args.slice(1)[0].split(' ')[1], 10)
        if (val < 3) {
            sendChat('QuestCrawl', `/w ${who} You rolled [[${val}]] and found no additional loot.`)
        } else if (val < 5) {
            sendChat('QuestCrawl', `/w ${who} You rolled [[${val}]] [Get a Random Common Item](!questcrawl --buy --item &#91;[1d6+1]&#93; --cost 0)`)
        } else if (val < 6) {
            sendChat('QuestCrawl', `/w ${who} You rolled [[${val}]] and have found 1 additional <em>Treasure</em>!`)
            setAttrs(character.id, {
                treasure: Math.min(character.treasure_max, character.treasure + 1)
            });
        } else {
            sendChat('QuestCrawl', `/w ${who} You rolled [[${val}]] [Get a Random Magic Item](!questcrawl --buy --item &#91;[1d6+7]&#93; --cost 0)`)
        }

    }

    function beastieResult(character, who, params) {
        const outcome = parseOutcome(params)
        if (outcome.result >= parseInt(params.challenge)) {
            if (params.type !== 'faction') {
                const treasureMessage = character.treasure === character.treasure_max ? 'You cannot carry anymore <em>Treasure</em>!' : 'You have collected 1 <em>Treasure</em>.'
                sendChat('QuestCrawl', `/w ${who} You rolled [[${outcome.result}]] and have defeated the <em>Terrible Beastie</em>! ${treasureMessage} [Roll to Loot](!questcrawl --loot &#91;[1d6]&#93;)`)
                setAttrs(character.id, {
                    treasure: Math.min(character.treasure_max, character.treasure + 1)
                });    
            } else {

            }
        } else {
            if (character.items.indexOf('Enchanted Shield') > -1) {
                const shield = randomInteger(6);
                if (shield > 3) {
                    sendChat('QuestCrawl', `/w ${who} You rolled [[${outcome.result}]] but your <em>Enchanted Shield</em> [[${shield}]] protected you!`)
                } else {
                    sendChat('QuestCrawl', `/w ${who} You rolled [[${outcome.result}]] and your <em>Enchanted Shield</em> [[${shield}]] failed you! Taking 1 <em>Injury</em>.`)
                    setAttrs(character.id, {
                        injuries: character.injuries + 1
                    });
                    if (shield === 1) {
                        outcome.b.push('enchanted-shield')
                    }
                }
            } else {
                sendChat('QuestCrawl', `/w ${who} You rolled [[${outcome.result}]]! Take 1 injury.`)
                setAttrs(character.id, {
                    injuries: character.injuries + 1
                });
            }
        }
        if (outcome.b.length > 0) {
            outcome.b.forEach((b) => {
                if (['enchanted-shield', 'magic-sword'].indexOf(b) > -1) {
                    sendChat('QuestCrawl', `/w ${who} <h3>Your <em>${items[b].name}</em> has broken! Open your character sheet and discard it.</h3>`)
                }
            })
        }

    }

    function beastie(character, who, args) {
        const params = getParams(args, 2)
        if (params.result) {
            return beastieResult(character, who, params)
        }
        let dice = ['1d6']
        params.source = ['hero']
        const commands = [`Challenge ${params.challenge}`]
        let label = 'Regular Attack '
        if ([character.suit1, character.suit2].indexOf(params.suit) !== -1) {
            dice.push('1d6')
            params.source.push('suit')
            label += '(with Suit Bonus) '
        }
        if (character.items.indexOf('Magic Sword') > -1) {
            dice.push('1d6')
            params.source.push('magic-sword')
            label += ', with Magic Sword Attack'
        }
        if (character.items.indexOf('Weapon of Legend') > -1) {
            dice.push('1d6')
            params.source.push('weapon-of-legend')
            label += ', with Weapon of Legend'
        }
        if (character.items.indexOf('Holy Rod') !== -1) {
            const token = getPartyToken();
            const left = parseInt(token.get('left'), 10)
            const top = parseInt(token.get('top'), 10)
            const coords = toCoords(left, top);
            const card = grid.get(coords)
            const nearQuest = card.getAllNeighbors().some((n) => {
                const x = grid.get(n)
                if (!x.faceup) {
                    return false;
                }
                const c = getObj('card', x.cardid)
                if (c.get('name').indexOf('Queen') === 0) {
                    return true
                }
            })
            if (nearQuest) {
                dice.push('1d6');
                params.source.push('holy-rod');
                label += ', with Holy Rod'
            }
        }
        commands.push(`[${label} ${dice.length}d6]${getBeastieCommandArgs(params, dice)}`)
        sendChat('QuestCrawl', `/w ${who} ${commands.join(' ')}`)

    }

    function shop(who, args) {
        let {currentMagicItem} = state.QuestCrawl
        const params = getParams(args, 2)
        const i = Object.keys(items)
        log(i)
        if (params.type === 'magic') {
            sendChat('Rogueish Shop Keep', `/w ${who} 
                ${magicItems.map((m) => {
                    return `[Buy 1 ${m.name}: 4 Treasure](!questcrawl --buy --item ${m.id} --cost 4)`;
                }).join('\n')}
            `);
            
        } else {
            if (currentMagicItem == null) {
                currentMagicItem = magicItems[Math.floor(rng() * (magicItems.length - 1))]
                state.QuestCrawl.currentMagicItem = currentMagicItem
            }
            const available = i.slice(1, 7).map((k, i) => {
                const name = items[k].name;
                const handout = findObjs({ type: 'handout', name: name })[0]
                return `[${name}](http://journal.roll20.net/handout/${handout.id}) [Buy for 1 Treasure](!questcrawl --buy --item ${i + 2} --cost 1)`
            })
            sendChat('Shop Keep', `/w ${who} [Buy 10 Supplies: 1 Treasure](!questcrawl --buy --item 1 --cost 1)<br/> ${available.join('<br/>')} [Buy 1 ${currentMagicItem.name}: 3 Treasure](!questcrawl --buy --item ${currentMagicItem.id} --cost 3)`);
        }

    }

    function start() {
        const players = getOnlinePlayers()
        const characters = findObjs({type: 'character'})
        players.forEach((p) => {
            const c = characters.filter((c) => c.get('controlledby') === p.id)
            const who = p.get('displayname');
            if (!c){
                sendChat('QuestCrawl', `/w ${who} [Create A Character](!questcrawl --create)`);
            } else {
                sendChat('QuestCrawl', `/w ${who} <h3>Confirm Your Character</h3><p>Your current characters:</p>`)
                c.forEach(x => {
                    sendChat('QuestCrawl', `/w ${who} <h4>[${x.get('name')}](http://journal.roll20.net/character/${x.id})</h4> (you can click this link to access the character sheet for editing.)</p> [Play ${x.get('name')}](!questcrawl --confirm --player ${p.id} --character ${x.id}) <hr/>`)
                })
                sendChat('QuestCrawl', `/w ${who} or [Create A new Character](!questcrawl --create)`);
            }
        })
    }

    function createCharacter(who, player) {
        const name = `${who}'s Character`;
        const character = createObj('character', {
            name,
            inplayerjournals: "all",
            controlledby: player.id
        })
        
        createObj('attribute', {
            characterid: character.id,
            name: 'supplies',
            current: 20,
            max: 20
        });

        createObj('attribute', {
            characterid: character.id,
            name: 'treasure',
            current: 1,
            max: 6
        });

        createObj('attribute', {
            characterid: character.id,
            name: 'injuries',
            current: 0,
            max: 5
        });

        state.QuestCrawl.players[player.id] = character.id

        sendChat('QuestCrawl', `/w ${who} [${name}](http://journal.roll20.net/character/${character.id}) Created, Click to Edit`);    
    }
    
    function heal(character, who, args) {
        const params = getNumericParams(args)
        const {players} = state.QuestCrawl
        if (character.treasure < params.cost) {
            sendChat('QuestCrawl', `/w ${who} You cannot afford this service.`)
            return
        }
        if (params.heal === 0) {
            // heal entire party
            Object.values(players).forEach((characterid) => {
                const attrs = {
                    injuries: 0
                };
                if (characterid === character.id) {
                    attrs.treasure = Math.max(0, character.treasure - params.cost)
                }
                setAttrs(characterid, attrs)
            })
            sendChat('QuestCrawl', `${character.name} has paid to heal the party.`)
            return;
        }

        setAttrs(character.id, {
            injuries: Math.max(0, character.injuries - params.heal),
            treasure: Math.max(0, character.treasure - params.cost)
        })
        sendChat('QuestCrawl', `/w ${who} You have been healed of ${params.heal} injuries`)
    }

    function buy(character, who, args) {
        const params = getNumericParams(args, 2)
        if (character.treasure < params.cost) {
            sendChat(`${params.cost === 4 ? 'Rogueish ' : ''}Shop Keep`, `/w ${who} You can't afford that right now, sorry.`)
            return
        }
        if ([1,20,21].indexOf(params.item) !== -1) {
            const sAmounts = {
                1: 10,
                20: 12,
                21: 20
            };
            const supplyAmount = sAmounts[params.item];
            if (character.supplies >= character.supplies_max) {
                sendChat('QuestCrawl', `/w ${who} You are already carrying all the supplies you can.`)
                return;
            }
            setAttrs(character.id, {
                supplies: Math.min(character.supplies_max, character.supplies + supplyAmount),
                treasure: Math.max(character.treasure - 1, 0)
            });
            sendChat('QuestCrawl', `/w ${who} <h3>${supplyAmount} Supplies were added to your character!</h3>`)
            return
        }
        if (character.inventory + 1 > character.inventory_max) {
            sendChat(`${params.cost === 4 ? 'Rogueish ' : ''}Shop Keep`, `/w ${who} You can't carry any more items.`)
            return
        }
        const rowid = `repeating_inventory_${generateRowID()}_item`
        const key = Object.keys(items)[params.item - 1]
        createObj('attribute', {
            name: `${rowid}`,
            characterid: character.id,
            current: key,
        }, {silent: true});
        createObj('attribute', {
            name: `${rowid}_img`,
            characterid: character.id,
            current: items[key].img,
        }, {silent: true});
        createObj('attribute', {
            name: `${rowid}_effect`,
            characterid: character.id,
            current: items[key].description,
        }, {silent: true});
        createObj('attribute', {
            name: `${rowid}_name`,
            characterid: character.id,
            current: items[key].name,
        }, {silent: true});
        setAttrs(character.id, {
            inventory: character.inventory + 1,
            treasure: character.treasure - params.cost
        }, {silent: true});
        sendChat('QuestCrawl', `/w ${who} <h3>${items[key].name} was added to your inventory!</h3>`)    
    }

    function twist(character, args) {
        const {mode} = state.QuestCrawl.config;
        if (character.treasure < 1) {
            sendChat('QuestCrawl', `The Pyramid requires treasure to function.`)
            return;
        }
        const params = getParams(args, 1)
        const {twist, x, y} = params

        let ccPropMap = [{y: 1},{x: -1},{x: -1},{y: 1},{y: -1},{x: 1},{x: 1},{y: -1}]
        let cPropMap = [{x: 1},{x: 1},{y: 1},{y: -1},{y: 1},{y: -1},{x: -1},{x: -1}]
        if (mode === 'hexagon') {
            ccPropMap = [{x: -0.5, y: 1},{x: -1},{x: 0.5, y: 1},{x: -0.5, y: -1},{x: 1},{x: 0.5, y: -1}]
            cPropMap = [{x: 1},{x: 0.5, y: 1},{x: 0.5, y: -1},{x: -0.5, y: 1},{x: -0.5, y: -1},{x: -1}]
        }
        const pyramid = grid.get({x: parseFloat(x, 10), y: parseFloat(y, 10)})
        const map = twist === 'cc' ? ccPropMap : cPropMap;
        pyramid.getAllNeighbors().map(n => grid.get(n)).forEach((ncard, i) => {
            if (!ncard.id) {
                return
            }
            const x = ncard.x + (map[i].x || 0);
            const y = ncard.y + (map[i].y || 0)
            grid.move(ncard, {x, y})
            const g = getObj('graphic', ncard.id)
            if (g) {
                if (mode === 'original') {
                    g.set({
                        left: offset + (x * cardSize),
                        top: offset + (y * cardSize)
                    })
                } else if (mode === 'hexagon') {
                    g.set({
                        left: hOffset + (x * ncard.cardSize.w),
                        top: vOffset + (y * offsets.y),
                    })
                }
            }
        });
        state.QuestCrawl.evil = Math.min(state.QuestCrawl.evil + 1, 3)
        setAttrs(character.id, {
            treasure: Math.max(character.treasure - 1, 0)
        });    
    }

    function generateIsland(deckid, args) {
        if(grid.get({x:0,y:0}).cardid) {
            log('Island Already Generated: Reset to Generate Again')
            return;
        }
        
        resetRng();

        const params = getParams(args, 2)

        if (params.static) {
            shuffleDeck(deckid, true, getCardsFromDeck(deckid))
        }

        const startingTown = findObjs({type: 'card', deckid, name: "Red Joker"})[0]
        drawCard(deckid, startingTown.id)
        const scard = new QuestCrawlCard({x: 0, y: 0, cardid: startingTown.id})
        scard.place(true)
        
        const l = findObjs({type: 'graphic', cardid: startingTown.id})[0]
        scard.id = l.id
        const gaps = parseInt(params.gaps, 10) || Math.floor(rng() * 6)
        const show = (parseInt(params.show, 10) === 1)
        if (gaps > 27) {
            sendError(who, 'Invalid Parameter --gaps must be less than 27')
            return;
        }
        const gapSplit = 54 / gaps
        let i = 0;
        while (placed.length < 54) {
            let target = grid.get(getRandomOpenCard().getRandomNeighbor());
            while (target.id) {
                if (open.length < 1) {
                    sendError("Unable to Generate Island")
                    return;
                }
                target = grid.get(getRandomOpenCard().getRandomNeighbor());
            }
            if ((gaps !== 0) && (i % gapSplit === 0)) {
                const gap = new GapCard({x: target.x, y: target.y})
                gap.place();
            } else {
                const cardid = drawCard(deckid)
                if (cardid === false || cardid.indexOf('-') !== 0) {
                    log(cardid)
                    log(open)
                    break;
                }
                const card = new QuestCrawlCard({x: target.x, y: target.y, cardid: cardid})
                card.place(show)
                const l = findObjs({type: 'graphic', cardid: cardid})[0]
                card.id = l.id
            }
            i++;
        }
        state.QuestCrawl.grid = grid.toJSON();    
    }

    function crisis(character, who, args) {
        const token = getPartyToken();
        const left = parseInt(token.get('left'), 10)
        const top = parseInt(token.get('top'), 10)
        const coords = toCoords(left, top);
        const card = grid.get(coords)

        const params = Object.assign({ source: ['hero'] }, getParams(args, 2));
        const {currentChampion} = state.QuestCrawl;
        if (currentChampion == null) {
            state.QuestCrawl.currentChampion = character.id
            sendChat('QuestCrawl', `/w ${who} You have taken up the Champion Challenge!`);
        } else if (character.id !== currentChampion) {
            sendChat('QuestCrawl', `/w ${who} Another party member is currently guiding your party.`)
            return
        } else {
            sendChat('QuestCrawl', `/w ${who} You are currently the party Champion.`)
        }
        if (params.result) {
            const outcome = parseOutcome(params)
            const challenge = parseInt(params.challenge, 10)
            if (challenge > outcome.result) {
                sendChat('QuestCrawl', `<h2 style='color: red;'>Safety could not be found, despite ${who}'s effort (${outcome.result}). Everyone takes 1 injury.</h2>`)
                getParty().forEach(c => {
                    setAttrs(c.id, {
                        injuries: Math.min(c.injuries + 1, c.injuries_max)
                    });
                });
                // add an injury to each party member, need a consistent way to get all party members
            } else {
                sendChat('QuestCrawl', `<h2>${who} leads everyone safely through the crisis (${outcome.result}).</h2>`)
            }
            state.QuestCrawl.currentChampion = null
            card.makeBlank()
            return
        }
        const dice =['1d6'];
        const commands = [`Challenge ${params.challenge}`, `[Step Down as Champion](!questcrawl --clearchampion ${character.id})`]
        let label = 'Regular Attack '
        if ([character.suit1, character.suit2].indexOf(params.suit) !== -1) {
            dice.push('1d6')
            params.source.push('suit')
            label += '(with Suit Bonus) '
        }
        if (character.items.indexOf('Survival Kit') !== -1) {
            dice.push('1d6')
            params.source.push('survival-kit')
            label += ', using Survival Kit';
        }
        if (character.items.indexOf('Holy Rod') !== -1) {
            const nearQuest = card.getAllNeighbors().some((n) => {
                const x = grid.get(n)
                if (!x.faceup) {
                    return false;
                }
                const c = getObj('card', x.cardid)
                if (c.get('name').indexOf('Queen') === 0) {
                    return true
                }
            })
            if (nearQuest) {
                dice.push('1d6');
                params.source.push('holy-rod');
                label += ', using Holy Rod'
            }
        }
        commands.push(`[${label} ${dice.length}d6]${getChallengeCommandArgs('crisis', params, dice)}`)
        sendChat('QuestCrawl', `/w ${who} You have chosen to lead your party to safety. ${commands.join(' ')}`)    
    }

    on("chat:message", (msg) => {
        if ( 'api' !== msg.type || !/^!questcrawl\b/i.test(msg.content)) {
            return
        }
        // gamestate stuff
        const {mode, deck} = state.QuestCrawl.config;
        // caller info
        let player = getObj('player', msg.playerid);
        let who = (player || {get:()=>'API'}).get('_displayname');

        let args = processInlinerolls(msg)
            .replace(/<br\/>\n/g, ' ')
            .replace(/(\{\{(.*?)\}\})/g," $2 ")
            .split(/\s+--/);

        if(args.find(n=>/^detect(\b|$)/i.test(n))) {
            detectGameState()
            return;
        }

        if(args.find(n=>/^endturn(\b|$)/i.test(n))) {
            endTurn()
            return;
        }

        if(args.find(n=>/^confirm(\b|$)/i.test(n))) {
            return confirmCharacter(player, who, args)
        }

        if(args.find(n=>/^character(\b|$)/i.test(n))) {
            return whisperCharacter(player, who, args)
        }

        if(args.find(n=>/^config(\b|$)/i.test(n))){
            return configure(who, args)
        }

        if (!state.QuestCrawl.config.deck) {
            log(state.QuestCrawl)
            sendError(who, `
                You must set a deck for questcrawl before using this mod
                !questcrawl --config --deck <Name of Deck>
            `)
            return;
        }
        
        const currentDeck = findObjs({type: 'deck', name: state.QuestCrawl.config.deck})[0]
        const deckid = currentDeck.id

        //converted
        if(args.find(n=>/^reset(\b|$)/i.test(n))) {
            return resetBoard(deckid);
        }

        const character = getCharacterJSON(player)

        if(args.find(n=>/^forage(\b|$)/i.test(n))) {
            return forage(character, who, args)
        }
        
        if(args.find(n=>/^loot(\b|$)/i.test(n))) {
            return loot(character, who, args)
        }

        if(args.find(n=>/^beastie(\b|$)/i.test(n))) {
            return beastie(character, who, args)
        }
                
        if(args.find(n=>/^start(\b|$)/i.test(n))) {
            return start()
        }

        if(args.find(n=>/^create(\b|$)/i.test(n))) {
            return createCharacter(who, player);
        }
        
        if(args.find(n=>/^heal(\b|$)/i.test(n))){
            return heal(character, who, args);
        }

        if(args.find(n=>/^help(\b|$)/i.test(n))){
            showHelp(who);
            return;
        }

        if(args.find(n=>/^buy(\b|$)/i.test(n))){
            return buy(character, who, args);
        }

        if(args.find(n=>/^twist(\b|$)/i.test(n))){
            return twist(character, args);
        }

        if(args.find(n=>/^generate(\b|$)/i.test(n))) {
            return generateIsland(deckid, args)
        }
                
        if(args.find(n=>/^crisis(\b|$)/i.test(n))){
            return crisis(character, who, args);
        }

        if(args.find(n=>/^shop(\b|$)/i.test(n))){
            return shop(who, args);
        }

        sendChat('QuestCrawl', `/w ${who} <div>Command ${msg.content} not recognized</div>[Help](!questcrawl --help)`)
    });

    on('change:graphic', (obj) => {
        const name = obj.get('name');
        if (name === "Party") {
            onPartyMoved(grid, obj)
        } else if(name === 'Farseeing Eye') {
            onFarseeingEyeMoved(grid, obj)
        }
    })
})

