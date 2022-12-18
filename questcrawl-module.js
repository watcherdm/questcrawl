"use strict";

on("ready", () => {
    let rng = Math.random;
    let sharedReward = null;
    let cardSize = 70;
    let offset = 1085;
    const vOffset = 847;
    const hOffset = 864;
    
    const offsets = {
        x: 37.5,
        y: 67
    }

    const numberMap = {
        'two': 2,
        'three': 3,
        'four': 4,
        'five': 5,
        'six': 6,
        'seven': 7,
        'eight': 8
    }

    function checkForMaps(c, commands) {
        if (c.items.indexOf('Map') !== -1) {
            commands.push(`[Use Map](!questcrawl --map &#91;[1d6]&#93; --cost 0 --removeitem ${getItemRowId(c, 'Map')})`)
        }
    }

    function checkForBookofSpells(c, commands) {
        if (c.items.indexOf('Book of Spells') !== -1) {
            getParty().forEach(x => {
                if (c.id === x.id) {return}
                commands.push(`[Cast Spell on ${x.name}](!questcrawl --bookofspells ${x.id})`)
            })
        }
    }

    function bookofspells(character, who, args) {
        const params = getParams(args, 1)
        setAttrs(character.id, {
            injuries: Math.min(character.injuries + 1, character.injuries_max)
        });
        if (!state.QuestCrawl.spells) {
            state.QuestCrawl.spells = {}
        }
        state.QuestCrawl.spells[params.bookofspells] = character.id
    }

    function checkArtifacts() {
        state.QuestCrawl.artifacts.dwarven_tunnel_passport = false
        state.QuestCrawl.artifacts.ancient_knowledge = false
        state.QuestCrawl.artifacts.pocket_pirate_ship = false
        getParty().forEach(c => {
            if (c.items.indexOf('Dwarven Tunnel Passport') > -1) {
                state.QuestCrawl.artifacts.dwarven_tunnel_passport = true
            }
            if (c.items.indexOf('Ancient Knowledge') > -1) {
                state.QuestCrawl.artifacts.ancient_knowledge = true
            }
            if (c.items.indexOf('Pocket Pirate Ship') > -1) {
                state.QuestCrawl.artifacts.pocket_pirate_ship = true
            }
        })
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
    
    function makeMacros() {
        const endTurnMacro = findObjs({type: 'macro', name: 'End-Turn'})[0]
        if (!endTurnMacro) {
            createObj('macro', {
                name: 'End Turn',
                action: '!questcrawl --endturn',
                visibleto: ["all"],
                istokenaction: true
            })
        }
        const characterMacro = findObjs({type: 'macro', name: 'Character'})[0]
        if (!characterMacro) {
            createObj('macro', {
                name: 'End Turn',
                action: '!questcrawl --endturn',
                visibleto: ["all"],
                istokenaction: true
            })
        }
    }

    function bandits(character, who, args) {
        const params = getParams(args, 1);
        const outcome = parseOutcome(params, who)
        if (parseInt(params.bandits) <= outcome.result) {
            sendChat('QuestCrawl', `/w ${who} You have managed to keep your treasure. ${renderOutcome(outcome)}`)
        } else {
            sendChat('QuestCrawl', `/w ${who} You were robbed by the bandits, 1 treasure was removed. ${renderOutcome(outcome)}`)
            setAttrs(character.id, {
                treasure: Math.max(character.treasure - 1, 0)
            });
        }

    }

    function checkForHealingHerbs(c, commands) {
        if (c.items.indexOf('Healing Herbs') !== -1 && c.injuries > 0) {
            commands.push(`[Heal an Injury with Herbs](!questcrawl --heal 1 --cost 0 --removeitem ${getItemRowId(c, 'Healing Herbs')})`)
        }
    }

    function holyrod(character, who, args) {
        const params = getParams(args, 1)
        const injuries = parseInt(getAttrByName(params.holyrod, 'injuries'), 10)
        
        setAttrs(params.holyrod, {
            injuries: Math.max(injuries - 1 , 0)
        });
        setAttrs(character.id, {
            injuries: Math.min(character.injuries + 1, character.injuries_max)
        })
    }

    function checkForHolyRod(c, commands) {
        if (c.items.indexOf('Holy Rod') !== -1) {
            getParty().forEach(x => {
                if(x.id === c.id) {return}
                if (x.injuries > 0) {
                    commands.push(`[Take ${x.name}'s Injury on Yourself](!questcrawl --holyrod ${x.id})`)
                }
            })
        }
    }

    function checkForBandits(card,c,commands) {
        const city_of_thieves = card.getAllNeighbors().find((c) => {
            return c.name === 'King of Diamonds' && c.faceup;
        })
        if (city_of_thieves && state.QuestCrawl.factions.city_of_thieves !== 2) {
            if (c.treasure !== 0) {
                const output = {
                    dice: ['1d6'],
                    source: ['hero'],
                    label: 'Fend off Bandits'
                }
                suitBonus(c, card, output)
                holyRodBonus(c, output)
                spellBonus(c, output)
                commands.push(`You were attacked by bandits! [${output.label} (${output.dice.length}d6)]${getChallengeCommandArgs(c, 'bandits 3', card, output)}`)
            }                
        }
    }

    function checkForEvil(card) {
        const unearthed_evil = card.getAllNeighbors().find((c) => {
            return c.name === 'King of Spades' && c.faceup;
        })
        if (unearthed_evil && state.QuestCrawl.factions.unearthed_evil !== 2 && numberMap[card.face]) {
            return true;
        }
        return false;
    }

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
            const comms = [`[Climb the Mountain](!questcrawl --climb)`]
            return comms.join(' ');
        },
        'Ace of Diamonds': (card) => {
            const comms = [`[Climb the Mountain](!questcrawl --climb)`]
            return comms.join(' ');
        },
        'Ace of Clubs': (card) => {
            const comms = [`[Climb the Mountain](!questcrawl --climb)`]
            return comms.join(' ');
        },
        'Ace of Spades': (card) => {
            const comms = [`[Climb the Mountain](!questcrawl --climb)`]
            return comms.join(' ');
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
            return `[Evade the Megabeast](!questcrawl --megabeast --suit diamonds --challenge 10)`;
        },
        'Ten of Clubs': (card) => {
            return `[Evade the Megabeast](!questcrawl --megabeast --suit clubs --challenge 10)`;
        },
        'Ten of Spades': (card) => {
            return `[Evade the Megabeast](!questcrawl --megabeast --suit spades --challenge 10)`;
        },
        'Jack of Hearts': (card) => {
            setTimeout(() => {
                const lost = randomInteger(6);
                if (lost === 1) {
                    sendChat('QuestCrawl', `The garden here begins to wither [1]. It will no longer bear a bounty for your party.`);
                    card.makeBlank();
                } else {
                    sendChat('QuestCrawl', `The garden here continues to be healthy [${lost}]. Your party may return here again.`);
                }    
            },2000)
            return `[Collect 20 Supplies](!questcrawl --buy --item 21 --cost 0)`;
        },
        'Jack of Diamonds': (card) => {
            return `[Investigate the Vault](!questcrawl --vault)`;
        },
        'Jack of Clubs': (card) => {
            return `
                [Trade 1 Treasure to flip three distant face-down Territories.](!questcrawl --map 3 --cost 1) 
                [Trade 3 Treasures to remove the Party’s Injuries.](!questcrawl --heal 0 --cost 3)`;
        },
        'Jack of Spades': (card) => {
            return `
                [Activate Counter-Clockwise](!questcrawl --twist cc --x ${card.x} --y ${card.y}) 
                [Activate Clockwise](!questcrawl --twist c --x ${card.x} --y ${card.y})`
        },
        'Red Joker': (card) => {
            if (checkEndGame()) {
                state.QuestCrawl.preventMove = () => {
                    sendChat('The End Beast must be destroyed, no more movement is allowed.')
                }
                return `[Fight the End Beast](!questcrawl --beastie --suit none --challenge 10 --type faction)`
            }
            return `[Shop](!questcrawl --shop) [Heal 3 Injuries: 1 Treasure](!questcrawl --heal 3 --cost 1)`
        },
        'Black Joker': (card) => {
            if ((state.QuestCrawl.factions || {}).city_of_thieves === 2) {
                return `[Shop](!questcrawl --shop) [Heal 3 Injuries: 1 Treasure](!questcrawl --heal 3 --cost 1)`
            } else {
                return `<h4>I Cannot Trade with you While Those Thieves Remain Active</h4>`
            }
        },
        'Queen of Hearts': ({suit}) => {
            return `[Reveal the Secrets of this Place](!questcrawl --quest ${suit})`
        },
        'Queen of Diamonds': ({suit}) => {
            return `[Reveal the Secrets of this Place](!questcrawl --quest ${suit})`
        },
        'Queen of Clubs': ({suit}) => {
            return `[Reveal the Secrets of this Place](!questcrawl --quest ${suit})`
        },
        'Queen of Spades': ({suit}) => {
            return `[Reveal the Secrets of this Place](!questcrawl --quest ${suit})`
        },
        'King of Hearts': (card) => {
            return `[Climb the Mountainhome of the Dwarves](!questcrawl --climb dwarves)`
        },
        'King of Diamonds': (card) => {
            // setup traps around here
            const comms = []
            if ((state.QuestCrawl.factions || {}).city_of_thieves === 1) {
                comms.push('[Continue Fighting the City of Thieves](!questcrawl --beastie --suit diamonds --challenge 8 --type faction)')
            } else {
                comms.push('[Fight the City of Thieves](!questcrawl --beastie --suit diamonds --challenge 8 --type faction)')
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
            if ((state.QuestCrawl.factions || {}).unearthed_evil === 1) {
                comms.push(`[Continue Fighting the Unearthed Evil](!questcrawl --beastie --suit spades --challenge ${12 - (evil || 0)} --type faction)`)
            } else {
                comms.push(`[Fight the Unearthed Evil](!questcrawl --beastie --suit spades --challenge ${12 - (evil || 0)} --type faction)`)
            }
            return comms.join('\n')
        },
        'Corrupted by Evil': (card) => {
            return `[Fight this Corrupted Evil](!questcrawl --beastie --suit ${card.suit} --challenge ${numberMap[card.face]})`;
        }
    }

    function vault(character, who, args) {
        const params = getParams(args, 1)
        if (params.vault) {
            sendChat('QuestCrawl', `${character.name} has opened the vault, inside are virtually endless treasures. Each character recieves 9 treasure.`)
            deleteRepeatingSectionRow(params.vault, character.id);
            getParty().forEach(c => {
                setAttrs(c.id, {
                    treasure: Math.min(c.treasure + 9, c.treasure_max)
                });
            })
            getCurrentCard().makeBlank()
            return
        }
        const keyHolder = getParty().find(c => c.items.indexOf('Vault Key') !== -1)
        if (!keyHolder) {
            sendChat('QuestCrawl', `Your party ponders this strange place, there must be a key somewhere.`)
            return
        }
        sendChat('QuestCrawl', `/w ${keyHolder.who} [Open the Vault](!questcrawl --vault ${getItemRowId(keyHolder, 'Vault Key')})`)
    }

    function quest(character, who, args) {
        const card = getCurrentCard()
        const params = getParams(args, 1)
        if (character.suit1 === params.quest) {
            sendChat('QuestCrawl', `/w ${who} You have completed your quest: ${character.quest}. Check your character sheet to select your second suit. `)
            setAttrs(character.id, {
                level: 2,
                mode: 'create'
            })
            card.makeBlank()
        } else {
            sendChat('QuestCrawl', `/w ${who} Your ally has completed their quest, you level up! You maximum injuries is now 6`)
            setAttrs(character.id, {
                max_injuries: 6
            });
        }
    }

    function resetConfig() {
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
            state.QuestCrawl.history = [{x: 0, y: 0, name: 'Red Joker'}];
        }
        if (!state.QuestCrawl.mapHistory) {
            state.QuestCrawl.mapHistory = [];
        }
        if (!state.QuestCrawl.mountains) {
            state.QuestCrawl.mountains = {};
        }
        if (!state.QuestCrawl.artifacts) {
            state.QuestCrawl.artifacts = {};
        }
        if (!state.QuestCrawl.quests) {
            state.QuestCrawl.quests = {};
        }
        state.QuestCrawl.currentChampion = null;
        const gridType = getObj('page', Campaign().get('playerpageid')).get('grid_type')
        if (gridType === 'square') {
            state.QuestCrawl.config.mode = 'original'
        } else if (gridType === 'hex') {
            state.QuestCrawl.config.mode = 'hexagon'
        }
    }

    resetConfig()
    
    function resetRng() {
        if (!state.QuestCrawl.config.seed) {
            state.QuestCrawl.seedGenerated = true
            state.QuestCrawl.config.seed = generateUUID()
        } else {
            state.QuestCrawl.seedGenerated = false
        }
        const seed = cyrb128(state.QuestCrawl.config.seed)
        rng = mulberry32(seed[0])
    }

    function endTurn() {
        state.QuestCrawl.day += 1;
        state.QuestCrawl.grid = grid.toJSON().map(c => c.toJSON());
        const players = getOnlinePlayers();
        players.forEach((player) => {
            const character = getCharacterJSON(player)
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
            setAttrs(character.id, output);
        });
        sendChat('QuestCrawl', `<h1>Day ${state.QuestCrawl.day} is over, supplies have been removed.</h1>`)
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
            });
            state.QuestCrawl.trackerid = tracker.id
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
        this.blank = blank
        
        try {
            this.card = getObj('card', cardid);
            this.name = this.card.get('name');
            this.face = this.name.split(' ')[0].toLowerCase();
            this.suit = this.name.split(' ').pop().toLowerCase();
            this.graphic = getObj('graphic', id);
        } catch (e) {
            log(`error getting object ${e.message}`)
        }

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
        if (faceup) {
            this.flip()
        }
    }
    
    function checkEndGame() {
        return ['hearts', 'diamonds', 'clubs', 'spades'].every(k => (state.QuestCrawl.quests || {})[k])
    }

    QuestCrawlCard.prototype = {
        getCoordString: function(){return `${this.x.toFixed(1)},${this.y.toFixed(1)}`},
        getRandomNeighborCoords: function(){
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
                return grid.get({x: x + n.x, y: y + n.y})
            });
        },
        place: function(faceup = false){
            const {mode} = state.QuestCrawl.config;
            if (faceup) {
                this.faceup = faceup
            }
            if (mode === 'original') {
                playCardToTable(this.cardid, {
                    ...toScreenGrid(this, this.cardSize),
                    layer: 'map',
                    currentSide: this.faceup ? 0 : 1
                });
            } else if (mode === 'hexagon') {
                playCardToTable(this.cardid, {
                    ...toScreenHex(this, this.cardSize),
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
        toString: function () {
            return `${this.x}:${this.y}:${this.cardid}:${this.id}`
        },
        toJSON: function() {
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
        flip: function(remote = false) {
            this.faceup = !this.faceup
            
            if (!this.graphic) {
                this.graphic = getObj('graphic', this.id);
            }
            const side = this.faceup ? 0 : 1;
            this.graphic.set({
                currentSide: side,
                imgsrc: decodeURIComponent(this.graphic.get('sides').split('|')[side].replace('med.png', 'thumb.png'))
            })

            const name = this.name
            if (remote) {
                if (name.indexOf('Nine') === 0) {
                    sendChat('QuestCrawl', `${name} is a Crisis, and will be returned to the face down position.`)
                    setTimeout(this.flip.bind(this), 3000)
                }
            }
            if (name.indexOf('Ace') === 0 || name === 'King of Hearts') {
                state.QuestCrawl.mountains = state.QuestCrawl.mountains || {};
                state.QuestCrawl.mountains[name] = this;
            }
            if (name.indexOf('Queen') === 0) {
                state.QuestCrawl.quests[this.suit] = true
            }
        },
        makeBlank: function() {
            this.blank = true;
        }
    }

    function GapCard({x, y}) {
        const {mode} = state.QuestCrawl.config
        this.x = x
        this.y = y
        this.id = 'Gap'
        this.cardid = 'Lake'
        this.faceup = true

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
        },
        getAllNeighbors: function() {
            let {x, y} = this;
            return this.neighbors.map((n) => {
                return grid.get({x: x + n.x, y: y + n.y})
            });
        }
    }

    function Grid() {
        this.internal = {}
        this.setup = true
    }
    
    Grid.prototype = {
        get: function({x, y}) {
            const card = this.internal[`${x.toFixed(1)},${y.toFixed(1)}`]
            if (card) {
                return card
            } else {
                return (this.setup) ? {x, y} : new GapCard({x,y});
            }
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

    function toScreenGrid({x, y}, cardSize) {
        return {
            left: offset + (x * cardSize),
            top: offset + (y * cardSize)
        }
    }

    function toScreenHex({x, y}, cardSize) {
        return {
            left: hOffset + (x * cardSize.w),
            top: vOffset + (y * offsets.y)
        }
    }


    let placed = []
    let open = []
    let grid;
    if (state.QuestCrawl.grid) {
        try {
            grid = Grid.fromJSON(state.QuestCrawl.grid)
        }  catch(e) {
            grid = new Grid()
        }
    } else {
        grid = new Grid()
    }

    function getPartyToken() {
        return getObj('graphic', state.QuestCrawl.tokenid)
    }

    function getFarseeingToken() {
        const partyToken = getPartyToken()
        return findObjs({type: 'graphic', name: 'Farseeing Eye', pageid: partyToken.get('pageid') })[0]
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

    function getItemRowId(character, item) {
        return character.itemIds.find(x => x.name === item).id;
    }

    function getCharacterItems(characterId) {
        return filterObjs((obj) => {
            if(obj.get("type") === 'attribute' && obj.get('characterid') === characterId &&
                 obj.get('name').indexOf('repeating_inventory') > -1 && obj.get('name').indexOf('_name') > -1) return true;
            else return false;
        }).map(w => {
            const result = {name: w.get('current'), id: w.get('name').replace(/^repeating_inventory_(.*)_item_\w+/ig, '$1')}
            return result
        });
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
        const who = player.get('displayname')
        const days = getAttrByName(id, 'days')
        const suit1 = getAttrByName(id, 'first_suit')
        const suit2 = getAttrByName(id, 'second_suit')
        const quest = getAttrByName(id, 'quest')
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
            who,
            items: items.map(x => x.name),
            quest,
            itemIds: items,
            suit1,
            suit2,
            name,
            days,
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

    function rabbitsFootResult(character, who, args) {
        const params = getParams(args, 1);
        const rolls = params[params.rabbitsfoot].split('|');
        const commands = rolls.map((r, i) => {
            const rollsCopy = rolls.slice()
            const next = args.slice(0).reduce((m, a) => {
                if (a.indexOf('rabbitsfoot') === 0) {
                    return m;
                }
                if (a.indexOf('result') === 0) {
                    rollsCopy.splice(i, 1, '&#91;[1d6]&#93;')
                    const replacedResult = ` --${params.rabbitsfoot} ${rollsCopy.join('|')}`
                    return m + replacedResult;
                }
                if (a.indexOf('!') === 0) {
                    return a;
                }
                return m + ` --${a}`
            }, '')
            return `[Reroll ${r}](${next} --removeitem ${getItemRowId(character, `Rabbit's Foot`)})`
        })
        commands.unshift(`[Keep All](${args.filter(a => a.indexOf('rabbitsfoot') !== 0).join(' --')})`)
        sendChat('QuestCrawl', `/w ${who} Would you like to discard your Rabbit's Foot to reroll? ${commands.join(' ')} = [${rolls.reduce((m, n) => m + parseInt(n, 10), 0)}]`)
    }

    function rabbitsFoot(character, command, key='result') {
        if (character.items.indexOf("Rabbit's Foot") !== -1) {
            return command.replace(/!questcrawl /, `!questcrawl --rabbitsfoot ${key} `);
        }
        return command;
    }

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

    function distributeFactionReward(key) {
        const party = getParty();
        let treasure = 5
        // treasure handed out
        while (treasure > 0) {
            const c = party.shift();
            c.treasure = Math.min(c.treasure_max, c.treasure + 1)
            setAttrs(c.id, {
                treasure: c.treasure,
            });
            treasure--;
            party.push(c);
        }
        party.forEach(c => {
            setAttrs(c.id, {
                supplies: Math.min(c.supplies_max, c.supplies + 10)
            })
        });
        state.QuestCrawl.factions[key] = 2
    }

    function handleFactionResult(character, who, card, params, outcome, key, name) {
        const {battlefield} = state.QuestCrawl
        if (battlefield[character.id] !== 0) {
            sendChat('QuestCrawl', `/w ${who} You have already resolved your challenge here. ${renderOutcome(outcome)}`);
            return
        }
        if (outcome.result < params.challenge) {
            testShield(character, who, outcome).then(() => {
                // defended by shield
            }, () => {
                setAttrs(character.id, {
                    injuries: Math.min(character.injuries + 1, character.injuries_max)
                });    
            })
        }

        battlefield[character.id] = outcome
        const party = getParty();

        if (party.some(c => battlefield[c.id] === 0)) {
            sendChat('QuestCrawl', `/w ${who} You rolled a ${renderOutcome(outcome)} against the ${name}. Waiting for others to finish battle.`)
            return
        } else {
            const victory = party.length / 2
            let successes = 0
            const battlereport = party.map(c => {
                const cOutcome = battlefield[c.id]
                const {result} = cOutcome
                const isSuccess = result > params.challenge
                if (isSuccess) { 
                    successes++ 
                }
                return `${c.name} rolled ${renderOutcome(cOutcome)}, ${isSuccess ? 'a success' : 'a failure'}.`
            });
            const won = successes >= victory;
            battlereport.push(`${ won ? 'A Victory!' : 'A Defeat!'}`)
            sendChat('QuestCrawl', `The battle with the ${name} is over. ${battlereport.join(' ')}`)
            if (won) {
                card.makeBlank()
                distributeFactionReward(key)
            }
            state.QuestCrawl.battlefield = null;
            state.QuestCrawl.preventMove = false;
        }

    }
    const factions = {
        initiate: {
            hearts: () => {
                if (state.QuestCrawl.factions.dwarves !== 1 || state.QuestCrawl.battlefield === null) {
                    state.QuestCrawl.factions.dwarves = 1
                
                    state.QuestCrawl.preventMove = () => { sendChat('QuestCrawl', 'Your party is currently engaged in war with the Dwarves. [Resend Chat](!questcrawl --look)') }
    
                    const party = getParty()
                    state.QuestCrawl.battlefield = party.reduce((m, {id}) => {
                        m[id] = 0;
                        return m;
                    }, {size: party.length})    
                }
            },
            diamonds: () => {
                if (state.QuestCrawl.factions.city_of_thieves !== 1 || state.QuestCrawl.battlefield === null) {
                    state.QuestCrawl.factions.city_of_thieves = 1
                    state.QuestCrawl.preventMove = () => { sendChat('QuestCrawl', 'Your party is currently engaged in war with the City of Thieves. [Resend Chat](!questcrawl --look)') }
    
                    const party = getParty()
                    state.QuestCrawl.battlefield = party.reduce((m, {id}) => {
                        m[id] = 0;
                        return m;
                    }, {size: party.length})    
                }
            },
            clubs: () => {
                if (state.QuestCrawl.factions.elves !== 1 || state.QuestCrawl.battlefield === null) {
                    state.QuestCrawl.factions.elves = 1
                    state.QuestCrawl.preventMove = () => { sendChat('QuestCrawl', 'Your party is currently engaged in war with the Elves. [Resend Chat](!questcrawl --look)') }
    
                    const party = getParty()
                    state.QuestCrawl.battlefield = party.reduce((m, {id}) => {
                        m[id] = 0;
                        return m;
                    }, {size: party.length})    
                }
            },
            spades: () => {
                if (state.QuestCrawl.factions.unearthed_evil !== 1 || state.QuestCrawl.battlefield === null) {
                    
                    state.QuestCrawl.factions.unearthed_evil = 1
                    state.QuestCrawl.preventMove = () => { sendChat('QuestCrawl', 'Your party is currently engaged in war with the Unearthed Evil. [Resend Chat](!questcrawl --look)') }

                    const party = getParty()
                    state.QuestCrawl.battlefield = party.reduce((m, {id}) => {
                        m[id] = 0;
                        return m;
                    }, {size: party.length})
                }
            },
            joker: () => {
                if (state.QuestCrawl.factions.endbeast !== 1 || state.QuestCrawl.battlefield === null) {
                    state.QuestCrawl.factions.endbeast = 1
                    state.QuestCrawl.preventMove = () => { sendChat('QuestCrawl', 'Your party is currently engaged in war with the End Beast. [Resend Chat](!questcrawl --look)') }
                    const party = getParty()
                    state.QuestCrawl.battlefield = party.reduce((m, {id}) => {
                        m[id] = 0;
                        return m;
                    }, {size: party.length})    
                }
            }
        },
        result: {
            hearts: (character, who, card, params, outcome) => {
                const key = 'dwarves'
                const name = 'Dwarves'
                handleFactionResult(character, who, card, params, outcome, key, name)
            },
            diamonds: (character, who, card, params, outcome) => {
                const key = 'city_of_thieves'
                const name = 'City of Thieves'
                handleFactionResult(character, who, card, params, outcome, key, name)
            },
            clubs: (character, who, card, params, outcome) => {
                const key = 'elves'
                const name = 'Elves'
                handleFactionResult(character, who, card, params, outcome, key, name)
            },
            spades: (character, who, card, params, outcome) => {
                const {battlefield} = state.QuestCrawl;
                battlefield[character.id] = outcome;
                const party = getParty();
                if (party.some(c => battlefield[c.id] === 0)) {
                    sendChat('QuestCrawl', `/w ${who} You rolled ${renderOutcome(outcome)} against the Unearthed Evil. Waiting for others to finish battle.`);
                    return;
                } else {
                    const victory = party.length / 2
                    let successes = 0
                    const battlereport = party.map(c => {
                        const {result} = battlefield[c.id]
                        const isSuccess = result >= params.challenge
                        if (isSuccess) { 
                            successes++ 
                        } else {
                            setAttrs(c.id, {
                                injuries: Math.min(c.injuries + 1, c.injuries_max)
                            });
                        }
                        return `${c.name} rolled ${renderOutcome(battlefield[c.id])}, ${isSuccess ? 'a success' : 'a failure'}.`
                    });
                    const won = successes >= victory;
                    battlereport.push(`${ won ? 'A Victory!' : 'A Defeat!'}`)
                    sendChat('QuestCrawl', `<h3>The battle with the Unearthed Evil is over. ${battlereport.join(' ')}</h3>`)
                    if (won) {
                        card.makeBlank()
                        state.QuestCrawl.magicItem = function (character, who, item) {
                            buy(character, who, ['questcrawl', 'buy', `item ${item}`, 'cost 0'])
                            sendChat('QuestCrawl', `${character.name} has claimed the ${items[Object.keys(items)[item - 1]].name}`);
                            state.QuestCrawl.magicItem = (lateCharacter, who, item) => {
                                sendChat('QuestCrawl', `/w ${who} ${character.name} already claimed this magic item.`)
                            }
                        }
                        state.QuestCrawl.vaultKey = function (character, who, item) {
                            buy(character, who, ['questcrawl', 'buy', `item ${item}`, 'cost 0'])
                            sendChat('QuestCrawl', `${character.name} has claimed the Vault Key`);
                            state.QuestCrawl.vaultKey = (lateCharacter, who, item) => {
                                sendChat('QuestCrawl', `/w ${who} ${character.name} already claimed the Vault Key.`)
                            }
                        }
                        state.QuestCrawl.orbOfChaos = function (character, who, item) {
                            buy(character, who, ['questcrawl', 'buy', `item ${item}`, 'cost 0'])
                            sendChat('QuestCrawl', `${character.name} has claimed the Orb of Chaos`);
                            state.QuestCrawl.orbOfChaos = (lateCharacter, who, item) => {
                                sendChat('QuestCrawl', `/w ${who} ${character.name} already claimed the Orb of Chaos.`)
                            }
                        }
                        // treasure handed out
                        sendChat('QuestCrawl', '[Claim a Random Magic Item](!questcrawl --claim magicItem --item &#91;[1d6+7]&#93;) [Claim the Vault Key](!questcrawl --claim vaultKey --item 17) [Claim the Orb of Chaos](!questcrawl --claim orbOfChaos --item 18)');
                        state.QuestCrawl.factions.unearthed_evil = 2;
                    } else {
                        sendChat('QuestCrawl', '<h3 style="color: red;">Your party has failed to defeat the Unearthed Evil, you have been chased off.</h3>');
                    }
                    state.QuestCrawl.battlefield = null;
                    state.QuestCrawl.preventMove = false;
                }
            },
            joker: (character, who, card, params, outcome) => {
                const {battlefield} = state.QuestCrawl
                battlefield[character.id] = outcome
                const party = getParty();
                if (party.some(c => battlefield[c.id] === 0)) {
                    sendChat('QuestCrawl', `/w ${who} You rolled ${renderOutcome(outcome)} against the End Beast. Waiting for others to finish battle.`)
                    return
                } else {
                    const victory = party.length / 2
                    let successes = 0
                    const battlereport = party.map(c => {
                        const {result} = battlefield[c.id]
                        const isSuccess = result >= params.challenge
                        if (isSuccess) { 
                            successes++ 
                        } else {
                            setAttrs(c.id, {
                                injuries: Math.min(c.injuries + 1, c.injuries_max)
                            });
                        }
                        return `${c.name} rolled ${renderOutcome(battlefield[c.id])}, ${isSuccess ? 'a success' : 'a failure'}.`
                    });
                    const won = successes >= victory;
                    battlereport.push(`${ won ? 'A Victory!' : 'A Defeat!'}`)
                    sendChat('QuestCrawl', `<h3>The battle with the End Beast is over. ${battlereport.join(' ')}</h3>`)
                    if (won) {
                        state.QuestCrawl.factions.endbeast = 2
                        sendChat('QuestCrawl', '<h1>Your party has saved the realm! The End Beast is no more! GAME OVER!</h1>')
                    } else {
                        sendChat('QuestCrawl', '<h3>Your party has failed to defeat the End Beast this time. [Try Again!](!questcrawl --look)</h3>')
                    }
                    state.QuestCrawl.battlefield = null;
                    state.QuestCrawl.preventMove = false;
                }
            }

        }
    }

    function getChallengeCommandArgs(character, challenge, params, output) {
        const inner = `!questcrawl --${challenge} --suit ${params.suit} --challenge ${params.challenge} --result ${output.dice.map(d => `&#91;[${d}]&#93;`).join("|")} --source ${output.source.join('|')} --type ${output.type}`;
        return `(${rabbitsFoot(character, inner)})`
    }

    function getBeastieCommandArgs(character, params, output) {
        return getChallengeCommandArgs(character, 'beastie', params, output);
    }

    function parseOutcome(params, who) {
        const source = params.source.split('|')
        return params.result.split('|').map(x => parseInt(x, 10)).reduce((m, r, i) => {
            m.result += r;
            m.rolls.push(r)
            m.vals[r] = m.vals[r] || 0
            m.vals[r]++;
            if (r === 1) {
                m.b.push(source[i])
            }
            return m;
        }, {result: 0, rolls: [], b: [], vals: {}, who})
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

    function chatCard(card, logEntry, name) {
        const handout = findObjs({type: 'handout', name: name})[0]
        return new Promise((resolve) => {
            handout.get("notes", (note) => {
                sendChat('QuestCrawl',`<div>
                    <img src="${handout.get('avatar')}"/>
                    <h5>${logEntry.name} ${card.blank ? 'Random Encounter!' : ''}</h5>
                    <p>${note}<p>
                    <p>${getCommand(name, card)}</p>
                </div>`);
                resolve()
            })
        })
    }

    function checkQuestInParty(card) {
        return getParty().some(c => c.suit1 === card.suit)
    }

    function getPirateReach(card) {
        return card.getAllNeighbors().reduce((m, c) => {
            if (c.id === 'Gap') {
                c.getAllNeighbors().map((n) => {
                    return n.cardid
                }).forEach((id) => {
                    if (m.indexOf(id) === -1 ) {
                        m.push(id)
                    }
                })
            } else {
                if (m.indexOf(c.cardid) === -1 ) {
                    m.push(c.cardid)
                }
            }
            return m
        }, [])
    }
    
    function onPartyMoved(grid, obj) {
        if (!grid.get({x: 0, y: 0}).id) {
            return sendChat('QuestCrawl', 'Game is not running, please click the Start macro for instructions.');
        }
        state.QuestCrawl.tokenid = obj.id
        const left = parseInt(obj.get("left"), 10)
        const top = parseInt(obj.get("top"), 10)
        const coord = toCoords(left, top)
        const logEntry = Object.assign({}, coord)
        const {config} = state.QuestCrawl;
        let card = grid.get(coord)
        if (card.id === 'Gap') {
            const oldPrevent = state.QuestCrawl.preventMove
            state.QuestCrawl.preventMove = () => {
                sendChat('QuestCrawl', 'You have attempted to move to an invalid location, returning to last location.');
                state.QuestCrawl.preventMove = oldPrevent
            }
        }
        let lastPos = getLastLogEntry();
        if (lastPos && card.getAllNeighbors) {
            const pirateReach = getPirateReach(card)
            if (state.QuestCrawl.artifacts.pocket_pirate_ship && pirateReach.indexOf(grid.get(lastPos).cardid) === -1) {
                state.QuestCrawl.preventMove = () => {
                    sendChat('QuestCrawl', 'Invalid move, you can only move to a connected territory or one connected by a gap (pocket pirate ship), returning to last location.')
                    state.QuestCrawl.preventMove = false;
                }
            } else if (!state.QuestCrawl.artifacts.pocket_pirate_ship && card.getAllNeighbors().map(x => x.cardid).indexOf(grid.get(lastPos).cardid) === -1) {
                state.QuestCrawl.preventMove = () => {
                    sendChat('QuestCrawl', 'Invalid move, you can only move to a connected territory, returning to last location.')
                    state.QuestCrawl.preventMove = false;
                }
            }
        }
        if (state.QuestCrawl.preventMove) {
            const {mode} = config;
            let screenPos = {};
            if (mode === 'original') {
                screenPos = toScreenGrid(lastPos, card.cardSize);
            }
            if (mode === 'hexagon') {
                screenPos = toScreenHex(lastPos, card.cardSize);
            }
            obj.set(screenPos)
            state.QuestCrawl.preventMove()
            return;
        }
        if (!card.faceup) {
            card.flip()
        }
        const data = getObj('card', card.cardid)
        let name = data.get('name')
        logEntry.name = name
        if (name.indexOf('Queen') === 0) {
            if (!checkQuestInParty(card)) {
                card.blank = true
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
        if(checkForEvil(card)) {
            name = 'Corrupted by Evil'
        }
        logEntry.asName = name
        chatCard(card, logEntry, name).then(() => {
            state.QuestCrawl.history.push(logEntry)
            state.QuestCrawl.currentMagicItem = null;
            getParty().map(c => {
                const commands = []
                checkForBandits(card, c, commands)
                log('bandits check')
                checkForMaps(c, commands)
                log('map check')
                checkForHealingHerbs(c, commands)
                log('healing herbs check')
                checkForHolyRod(c, commands)
                log('holyrod check')
                checkForBookofSpells(c, commands)
                log('book of spells check')
                sendChat('QuestCrawl', `/w ${c.who} ${commands.join(' ')}`)
            })
        });
    }

    function getLastLogEntry(move = true) {
        if (move) {
            return getMoveHistory().slice(0).pop()
        } else {
            const {history} = state.QuestCrawl
            return history.slice(0).pop()
        }
    }

    function getCurrentCard(logEntry = getLastLogEntry()) {
        return grid.get(logEntry)
    }

    function look() {
        const logEntry = getLastLogEntry()
        const card = getCurrentCard()
        const name = (logEntry.asName || logEntry.name)
        chatCard(card, logEntry, name).then(() => {
            getParty().map(c => {
                const commands = []
                checkForBandits(card, c, commands)
                log('bandits check')
                checkForMaps(c, commands)
                log('map check')
                checkForHealingHerbs(c, commands)
                log('healing herbs check')
                checkForHolyRod(c, commands)
                log('holyrod check')
                checkForBookofSpells(c, commands)
                log('book of spells check')
                sendChat('QuestCrawl', `/w ${c.who} ${commands.join(' ')}`)
            })
        });

    }

    function getMoveHistory() {
        return state.QuestCrawl.history.filter(x => x.type !== 'map');
    }

    function onFarseeingEyeMoved(grid, obj) {
        const left = parseInt(obj.get("left"), 10)
        const top = parseInt(obj.get("top"), 10)
        const coord = toCoords(left, top)
        const logEntry = Object.assign({}, coord)
        const {mapHistory, config} = state.QuestCrawl;
        let card = grid.get(coord)
        if (!card.cardid || card.id === 'Gap') {
            const oldPrevent = state.QuestCrawl.preventMove
            state.QuestCrawl.preventMove = () => {
                sendChat('QuestCrawl', 'You have attempted to move to an invalid location, returning to last location.');
                state.QuestCrawl.preventMove = oldPrevent
            }
        }
        let lastPos = mapHistory[mapHistory.length - 1];
        if (mapHistory.length === 0) {
            // we are placing for the first time, accept any facedown card.
            if (card.faceup) {
                state.QuestCrawl.preventMove = () => {
                    sendChat('QuestCrawl', 'Invalid move, you already know this land, place the eye on a face-down territory.')
                    state.QuestCrawl.preventMove = false;
                }
            }
        } else {
            if (lastPos && card.getAllNeighbors) {
                if (card.getAllNeighbors().indexOf(grid.get(lastPos)) === -1) {
                    state.QuestCrawl.preventMove = () => {
                        sendChat('QuestCrawl', 'Invalid move, you can only move to a connected territory, returning to last location.')
                        state.QuestCrawl.preventMove = false;
                    }
                }
            }    
        }
        if (state.QuestCrawl.preventMove) {
            const {mode} = config;
            if (!lastPos || !card.id || card.id === 'Gap') {
                lastPos = lastPos || {x: 0, y: 0};
                card = grid.get(lastPos);
            }
            let screenPos = toScreenGrid(lastPos, card.cardSize);
            if (mode === 'hexagon') {
                screenPos = toScreenHex(lastPos, card.cardSize);
            }
            obj.set(screenPos)
            state.QuestCrawl.preventMove()
            return;
        }
        if (!card.faceup) {
            card.flip(true)
        }
        const data = getObj('card', card.cardid)
        let name = data.get('name')
        chatCard(card, logEntry, name).then(() => {
            state.QuestCrawl.mapHistory.push(logEntry)
            logEntry.type = 'map'
            state.QuestCrawl.history.push(logEntry) // add to beginning of log to support previously visited.
            state.QuestCrawl.farSightRemaining--
            getFarseeingToken().set({
                bar2_value: state.QuestCrawl.farSightRemaining
            })
            if (state.QuestCrawl.farSightRemaining === 0) {
                getPartyToken().set({
                    layer: 'objects'
                })
                getFarseeingToken().set({
                    layer: 'gmlayer'
                })
                state.QuestCrawl.mapHistory = [];
                state.QuestCrawl.config.commands = true
            }
        });
    }


    function deleteRepeatingSectionRow(rowid, characterid) {
        const regex = new RegExp(`^repeating_inventory_${rowid}_.*?`);
        const attrsInRow = filterObjs((obj) => {
            if (obj.get('type') !== 'attribute' || obj.get('characterid') !== characterid) return false;
            return regex.test(obj.get('name'));
        });
        _.each(attrsInRow, (attribute) => {
            attribute.remove();
        });
        const inventory = getAttrByName(characterid, 'inventory')
        setAttrs(characterid, {
            inventory: inventory - 1
        });
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
        state.QuestCrawl.config = Object.assign(state.QuestCrawl.config, params);
        return;
    }

    function resetBoard(deckid) {
        setTimeout(() => {
            recallCards(deckid);
            setTimeout(() => {
                shuffleDeck(deckid);
                setTimeout(() => {
                    recallCards(deckid);
                    setTimeout(() => {
                        shuffleDeck(deckid);
                        grid = new Grid();
                        placed = [];
                        open = [];
                        state.QuestCrawl.day = 0;
                        state.QuestCrawl.evil = 0;
                        state.QuestCrawl.currentChampion = 0;
                        state.QuestCrawl.preventMove = false;
                        state.QuestCrawl.history = [];
                        state.QuestCrawl.mapHistory = [];
                        state.QuestCrawl.quests = {};
                        state.QuestCrawl.spells = {};
                        delete state.QuestCrawl.factions;
                        updateTracker();
                        resetConfig();
                    }, 100);
                }, 100);
            }, 100);
        }, 100);
    }

    function forageResult(character, who, params) {
        const outcome = parseOutcome(params);
        const {result} = outcome;
        if (result >= parseInt(params.challenge, 10)) {
            sendChat('QuestCrawl', `${character.name} rolled ${renderOutcome(outcome)} and was able to successfully forage ${result} supplies today!`);
            setAttrs(character.id, {
                supplies: Math.min(character.supplies_max, character.supplies + result)
            });
        } else {
            sendChat('QuestCrawl', `${character.name} rolled ${renderOutcome(outcome)} and failed to collect any supplies today.`);
        }
        if (params.source.indexOf('ancient-knowledge') !== -1 && Object.values(outcome.vals).some(x => x > 1)) {
            sendChat('QuestCrawl', `/w ${who} The secrets of the Elves has lead you to discover Healing Herbs here. [Collect Healing Herbs](!questcrawl --buy --item 6 --cost 0)`);
        }
        discardBrokenItems(character, who, outcome);
    }

    function ancientKnowledgeBonus(output) {
        if ((state.QuestCrawl.artifacts || {}).ancient_knowledge) {
            output.source.push('ancient-knowledge')
            output.dice.push('1d6')
            output.label += ', with Ancient Knowledge'
        }
    }

    function forage(character, who, args) {
        const params = getParams(args, 2)
        if (params.result) {
            return forageResult(character, who, params)
        }
        const output = {
            dice: ['1d6'],
            source: ['hero'],
            label: 'Regular Foraging'
        };
        suitBonus(character, params, output)
        ancientKnowledgeBonus(output)
        holyRodBonus(character, output)
        spellBonus(character, output)
        sendChat('QuestCrawl', `/w ${who} [${output.label} ${output.dice.length}d6]${getChallengeCommandArgs(character, 'forage', params, output)}`)
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

    function renderOutcome(outcome) {
        return `${outcome.rolls.map(r => `[[${r}]]`).join('+')} = [[${outcome.result}]]`
    }

    function testShield(character, who, outcome) {
        return new Promise((resolve, reject) => {
            if (character.items.indexOf('Enchanted Shield') > -1) {
                const shield = randomInteger(6);
                if (shield > 3) {
                    sendChat('QuestCrawl', `/w ${who} You rolled ${renderOutcome(outcome)} but your <em>Enchanted Shield</em> [[${shield}]] protected you!`)
                    resolve()
                } else {
                    sendChat('QuestCrawl', `/w ${who} You rolled ${renderOutcome(outcome)} and your <em>Enchanted Shield</em> [[${shield}]] failed you! Taking 1 <em>Injury</em>.`)
                    if (shield === 1) {
                        outcome.b.push('enchanted-shield')
                    }
                    reject()
                }
            } else {
                sendChat('QuestCrawl', `/w ${who} You rolled ${renderOutcome(outcome)}! Take 1 injury.`)
                reject()
            }
        })
    }

    function discardBrokenItems(character, who, outcome) {
        if (outcome.b.length > 0) {
            outcome.b.forEach((b) => {
                if (['enchanted-shield', 'magic-sword', 'holy-rod', 'elven-cloak', 'compass', 'survival-kit', 'mountaineering-gear'].indexOf(b) > -1) {
                    deleteRepeatingSectionRow(getItemRowId(character, items[b].name), character.id)
                    sendChat('QuestCrawl', `/w ${who} <h3>Your <em>${items[b].name}</em> has broken! It has been removed from your character sheet.</h3>`)
                }
            })
        }
    }

    function beastieResult(character, who, params) {
        const outcome = parseOutcome(params)
        if (params.type !== 'faction') {
            if (outcome.result >= parseInt(params.challenge)) {
                const treasureMessage = character.treasure === character.treasure_max ? 'You cannot carry anymore <em>Treasure</em>!' : 'You have collected 1 <em>Treasure</em>.'
                sendChat('QuestCrawl', `${character.name} rolled ${renderOutcome(outcome)} and has  defeated the <em>Terrible Beastie</em>!`)
                sendChat('QuestCrawl', `/w ${who} ${treasureMessage} [Roll to Loot](${rabbitsFoot(character, '!questcrawl --loot &#91;[1d6]&#93;)', 'loot')}`)
                setAttrs(character.id, {
                    treasure: Math.min(character.treasure_max, character.treasure + 1)
                });    
            } else {
                testShield(character, who, outcome).then(() => {
                    // shield defended
                }, () => {
                    setAttrs(character.id, {
                        injuries: character.injuries + 1
                    });
                })
            }
        } else {
            const card = getCurrentCard()
            factions.result[card.suit](character, who, card, params, outcome)
        }
        discardBrokenItems(character, who, outcome)
    }

    function spellBonus(character, output) {
        const caster = (state.QuestCrawl.spells || {})[character.id]
        if (caster) {
            output.dice.push('1d6')
            output.source.push('book-of-spells')
            const name = getObj('character', caster).get('name')
            output.label += `, with a Spell cast by ${name}`
            delete (state.QuestCrawl.spells || {})[character.id]
        }
    }

    function itemBonus(itemKey, character, output) {
        const {name} = items[itemKey]
        if (character.items.indexOf(name) === -1) {
            return
        }
        output.dice.push('1d6')
        output.source.push(itemKey)
        output.label += `, with ${name}`;
    }

    function beastie(character, who, args) {
        const params = getParams(args, 2)
        if (params.result) {
            if (params.type === 'faction') {
                const card = getCurrentCard()
                factions.initiate[card.suit](character, who, card)
            }
            return beastieResult(character, who, params)
        }
        const output = {
            dice: ['1d6'],
            source: ['hero'],
            label: 'Regular Attack',
            type: params.type
        }
        const commands = [`Challenge ${params.challenge}`]
        if (params.suit !== 'none') {
            suitBonus(character, params, output)
            itemBonus('magic-sword', character, output)    
        }
        itemBonus('weapon-of-legend', character, output)
        holyRodBonus(character, output)
        spellBonus(character, output)
        commands.push(`[${output.label} ${output.dice.length}d6]${getBeastieCommandArgs(character, params, output)}`)
        sendChat('QuestCrawl', `/w ${who} ${commands.join(' ')}`)
    }

    function shop(who, args) {
        let {currentMagicItem} = state.QuestCrawl
        const params = getParams(args, 2)
        const i = Object.keys(items)
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

    const itemCommands = {
        'healing-herb': (c, key) => `[Use Healing Herbs](!questcrawl --heal 1 --cost 0 --removeitem ${key})`,
        'map': (c, key) => `[Use Map](!questcrawl --map &#91;[1d6]&#93; --cost 0 --removeitem ${key})`
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
                treasure: Math.max(character.treasure - params.cost, 0)
            });
            sendChat('QuestCrawl', `/w ${who} <h3>${supplyAmount} Supplies were added to your character!</h3>`)
            return
        }
        if (character.inventory + 1 > character.inventory_max) {
            sendChat(`${params.cost === 4 ? 'Rogueish ' : ''}Shop Keep`, `/w ${who} You can't carry any more items.`)
            return
        }
        const rowKey = generateRowID()
        const rowid = `repeating_inventory_${rowKey}_item`
        const key = Object.keys(items)[params.item - 1]
        const item = createObj('attribute', {
            name: `${rowid}`,
            characterid: character.id
        });

        onSheetWorkerCompleted(function() {
            // createObj('attribute', {
            //     name: `${rowid}_img`,
            //     characterid: character.id,
            //     current: items[key].img,
            // }, {silent: true});
            // createObj('attribute', {
            //     name: `${rowid}_effect`,
            //     characterid: character.id,
            //     current: items[key].description,
            // }, {silent: true});
            // createObj('attribute', {
            //     name: `${rowid}_name`,
            //     characterid: character.id,
            //     current: items[key].name,
            // }, {silent: true});
            setAttrs(character.id, {
                inventory: character.inventory + 1,
                treasure: character.treasure - params.cost
            });

            sendChat('QuestCrawl', `<h3>${character.name} added ${items[key].name} to their inventory!</h3>`)
            if (itemCommands[key]) {
                sendChat('QuestCrawl', `/w ${who} ${itemCommands[key](character, rowKey)}`)
            }
        })

        item.setWithWorker({current: key})
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
        pyramid.getAllNeighbors().forEach((ncard, i) => {
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
        sendChat('QuestCrawl', `${character.name} has activated the twisting pyramid. The landscape shifts around you, the evil has become less powerful [${12 - state.QuestCrawl.evil}]!`)
        setAttrs(character.id, {
            treasure: Math.max(character.treasure - 1, 0)
        });    
    }

    function generateIsland(deckid, args) {
        if(grid.get({x:0,y:0}).cardid) {
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
        toFront(l)
        scard.id = l.id
        const gaps = parseInt(params.gaps, 10) || Math.floor((rng() * 18) + 10)
        const show = (parseInt(params.show, 10) === 1)
        if (gaps > 27) {
            sendError(who, 'Invalid Parameter --gaps must be less than 27')
            return;
        }
        sendChat('QuestCrawl', `island seed: ${state.QuestCrawl.config.seed} gaps: ${gaps}`)
        if (state.QuestCrawl.seedGenerated) {
            state.QuestCrawl.config.seed = null
        }
        const gapSplit = 54 / gaps
        let i = 0;
        while (placed.length < 54) {
            let target = grid.get(getRandomOpenCard().getRandomNeighborCoords());
            while (target.id) {
                if (open.length < 1) {
                    sendError("Unable to Generate Island")
                    return;
                }
                target = grid.get(getRandomOpenCard().getRandomNeighborCoords());
            }
            if ((gaps !== 0) && (i % gapSplit === 0)) {
                const gap = new GapCard({x: target.x, y: target.y})
                gap.place();
            } else {
                const cardid = drawCard(deckid)
                if (cardid === false || cardid.indexOf('-') !== 0) {
                    break;
                }
                const card = new QuestCrawlCard({x: target.x, y: target.y, cardid: cardid})
                card.place(show)
                const l = findObjs({type: 'graphic', cardid: cardid})[0]
                card.id = l.id
                toFront(l)
            }
            i++;
            log(i)
        }
        grid.setup = false
        state.QuestCrawl.grid = grid.toJSON().map(c => c.toJSON());
    }

    function canBecomeChampion(who, character) {
        const {currentChampion} = state.QuestCrawl;
        if (currentChampion == null) {
            state.QuestCrawl.currentChampion = character.id
            sendChat('QuestCrawl', `${character.name} has taken up the Champion Challenge!`);
            return true
        } else if (character.id !== currentChampion) {
            sendChat('QuestCrawl', `/w ${who} Another party member is currently guiding your party.`)
            return false
        } else {
            sendChat('QuestCrawl', `/w ${who} You are currently the party Champion.`)
            return true
        }
    }

    function injureParty(amount) {
        getParty().forEach(c => {
            setAttrs(c.id, {
                injuries: Math.min(c.injuries + amount, c.injuries_max)
            });
        });
    }

    function crisisResult(character, who, params) {
        const card = getCurrentCard()
        const outcome = parseOutcome(params)
        const challenge = parseInt(params.challenge, 10)
        state.QuestCrawl.currentChampion = null
        card.makeBlank()
        if (challenge > outcome.result) {
            injureParty(1)
            sendChat('QuestCrawl', `<h2 style='color: red;'>Safety could not be found, despite ${character.name}'s effort, rolling (${renderOutcome(outcome)}). Everyone takes 1 injury.</h2>`)
            return
        }
        discardBrokenItems(character, who, outcome)
        sendChat('QuestCrawl', `<h2>${character.name} leads everyone safely through the crisis, rolling ${renderOutcome(outcome)}.</h2>`)
    }

    function suitBonus(character, params, output) {
        if ([character.suit1, character.suit2].indexOf(params.suit) !== -1) {
            output.dice.push('1d6')
            output.source.push('suit')
            output.label += '(with Suit Bonus) '
        }
    }

    function holyRodBonus(character, output) {
        if (character.items.indexOf('Holy Rod') !== -1) {
            const card = getCurrentCard()

            const nearQuest = card.getAllNeighbors().some((c) => {
                if (!c.faceup || c.id === 'Gap') {
                    return false;
                }
                if (c.name.indexOf('Queen') === 0) {
                    return true
                }
            })
            if (nearQuest) {
                output.dice.push('1d6');
                output.source.push('holy-rod');
                output.label += ', using Holy Rod'
            }
        }
    }

    function clearchampion(character, who, args) {
        const params = getParams(args, 1);
        if (state.QuestCrawl.currentChampion === params.clearchampion) {
            state.QuestCrawl.currentChampion = null;
        }
    }

    function crisis(character, who, args) {

        const params = getParams(args, 2);
        if (!canBecomeChampion(who, character)) {
            return;
        }
        if (params.result) {
            return crisisResult(character, who, params);
        }
        const output = {
            dice: ['1d6'],
            source: ['hero'],
            label: 'Regular Attempt'
        }
        const commands = [`<h2>Challenge ${params.challenge}</h2>`, `[Step Down as Champion](!questcrawl --clearchampion ${character.id})`]
        suitBonus(character, params, output);
        itemBonus('survival-kit', character, output)
        holyRodBonus(character, output);
        spellBonus(character, output);
        commands.push(`[${output.label} ${output.dice.length}d6]${getChallengeCommandArgs(character, 'crisis', params, output)}`)
        sendChat('QuestCrawl', `/w ${who} You have chosen to lead your party to safety. ${commands.join(' ')}`)    
    }

    function climbResult(character, who, params) {
        const {history, config} = state.QuestCrawl;
        const {mode} = config;
        const card = getCurrentCard()
        const outcome = parseOutcome(params)
        const challenge = parseInt(params.challenge, 10)
        state.QuestCrawl.currentChampion = null
        if (challenge > outcome.result) {
            // move the party token, back to the previous tile
            const origin = getMoveHistory().slice(-2).shift()
            let screenPos = toScreenGrid(origin, card.cardSize)
            if (mode === 'hexagon') {
                screenPos = toScreenHex(origin, card.cardSize)
            }
            getPartyToken().set(screenPos)
            history.push(origin)
            sendChat('QuestCrawl', `<h2 style='color: red;'>Your party was unable to scale the reaches, despite ${character.name}'s effort, rolling (${renderOutcome(outcome)}). You return to where you left from.</h2>`)
            return
        }
        card.getAllNeighbors().forEach(card => {
            if (card && !card.faceup) {
                if (card.flip) {
                    card.flip(true)
                    const logEntry = {x: card.x, y: card.y, name: card.name, type: 'map'}
                    history.push(logEntry)
                }
            }
        })
        sendChat('QuestCrawl', `<h2>${character.name} leads everyone up the mountain, rolling (${renderOutcome(outcome)}).</h2>`)
        const name = card.name;
        if (params.climb === 'dwarves') {
            sendChat('QuestCrawl', `${dwarves()}`);
        } else {
            if ((state.QuestCrawl.artifacts || {}).dwarven_tunnel_passport) {
                sendChat('QuestCrawl', `[Take the Tunnels: Use Passport!](!questcrawl --tunnel --origin ${name.split(' ').join('-')} --cost 0)`)
            }
            if (name.indexOf('Spades') !== -1) {
                if (!state.QuestCrawl.motorhead) {
                    sendChat('QuestCrawl', `/w ${who} At the peak of the mountain you find a [Magic Item](!questcrawl --buy --item &#91;[1d6+7]&#93; --cost 0)`)
                    state.QuestCrawl.motorhead = true
                }
            }    
        }
        discardBrokenItems(character, who, outcome)
    }

    function dwarves() {
        const comms = []
        if ((state.QuestCrawl.factions || {}).dwarves === 1) {
            comms.push('[Continue Fighting the Dwarves](!questcrawl --beastie --suit hearts --challenge 8 --type faction)')
        } else {
            comms.push('[Fight the Dwarves](!questcrawl --beastie --suit hearts --challenge 8 --type faction)')
            comms.push('[Buy 1 Enchanted Shield: 3 Treasure](!questcrawl --buy --item 9 --cost 3)')
            if ((state.QuestCrawl.artifacts || {}).dwarven_tunnel_passport) {
                comms.push('[Take the Tunnels: Use Passport!](!questcrawl --tunnel --origin King-of-Hearts --cost 0)')
            } else if ((state.QuestCrawl.factions || {}).elves === 2) {
                comms.push('[Claim Dwarven Tunnel Passport](!questcrawl --claim dwarvenTunnelPassport --item 14)')
            } else {
                comms.push('[Take the Tunnels: 1 Treasure](!questcrawl --tunnel --origin King-of-Hearts --cost 1)')
            }
        }
        return comms.join('\n')

    }

    function climb(character, who, args) {
        const params = getParams(args, 1);
        params.challenge = 5;
        if (!canBecomeChampion(who, character)) {
            return
        }
        const commands = [`Challenge ${params.challenge}`, `[Step Down as Champion](!questcrawl --clearchampion ${character.id})`]
        if (params.result) {
            return climbResult(character, who, params);
        }
        const output = {
            dice: ['1d6'],
            source: ['hero'],
            label: 'Regular Ascent'
        };
        itemBonus('mountaineering-gear', character, output);
        holyRodBonus(character, output);
        spellBonus(character, output)
        commands.push(`[${output.label} ${output.dice.length}d6]${getChallengeCommandArgs(character, `climb ${params.climb}`, params, output)}`)
        sendChat('QuestCrawl', `/w ${who} You have chosen to lead your party up the mountain. ${commands.join(' ')}`)
    }

    function hardlandsResult(character, who, params) {
        const outcome = parseOutcome(params)
        const challenge = parseInt(params.challenge, 10)
        state.QuestCrawl.currentChampion = null
        discardBrokenItems(character, who, outcome)
        if (challenge > outcome.result) {
            state.QuestCrawl.preventMove = () => { sendChat('QuestCrawl', 'Your party is lost in the wilderness. [Resend Chat](!questcrawl --look)') }
            sendChat('QuestCrawl', `<h2 style='color: red;'>Your party has become lost in the hard lands, despite ${character.name}'s effort (${renderOutcome(outcome)}). End the turn and try again tomorrow.</h2>`)
            return
        }
        state.QuestCrawl.preventMove = false
        sendChat('QuestCrawl', `<h2>${character.name} leads everyone safely out of the hard lands (${renderOutcome(outcome)}). End the turn and move tomorrow.</h2>`)
    }

    function hardlands(character, who, args) {
        const params = getParams(args, 2);
        if (!canBecomeChampion(who, character)) {
            return
        }
        const commands = [`Challenge ${params.challenge}`, `[Step Down as Champion](!questcrawl --clearchampion ${character.id})`]
        if (params.result) {
            return hardlandsResult(character, who, params);
        }
        const output = {
            dice: ['1d6'],
            source: ['hero'],
            label: 'Regular Guidance'
        };
        suitBonus(character, params, output);
        itemBonus('compass', character, output);
        holyRodBonus(character, output);
        spellBonus(character, output)
        commands.push(`[${output.label} ${output.dice.length}d6]${getChallengeCommandArgs(character, 'hardlands', params, output)}`)
        sendChat('QuestCrawl', `/w ${who} You have chosen to lead your party out of these hardlands. ${commands.join(' ')}`)
    }

    function megabeastResult(character, who, params) {
        const outcome = parseOutcome(params)
        const challenge = parseInt(params.challenge, 10)
        state.QuestCrawl.currentChampion = null
        discardBrokenItems(character, who, outcome)
        if (challenge > outcome.result) {
            sendChat('QuestCrawl', `<h2 style='color: red;'>Your party has been found by the Megabeast, despite ${character.name}'s effort (${renderOutcome(outcome)}). Everyone takes 2 injuries!</h2>`)
            getParty().forEach(c => setAttrs(c.id, {injuries: Math.min(c.injuries + 2, c.injuries_max)}))
            return
        }
        const {history} = state.QuestCrawl
        const coord = getLastLogEntry()
        const rest = history.slice(0, history.indexOf(coord))
        const previouslyVisited = rest.find(({name}) => name === coord.name);
        if (previouslyVisited) {
            sendChat('QuestCrawl', `<h2>${character.name} successfully leads everyone on a heist to rob the Megabeast's lair (${renderOutcome(outcome)}). You escape with 2 Treasure, 1 Random Magic Item, and 1 Weapon of Legend.</h2>`)
            sendChat('QuestCrawl', `/w ${who} [Collect Random Magic Item](!questcrawl --buy --item &#91;[1d6+7]&#93; --cost 0) [Collect Weapon of Legend](!questcrawl --buy --item 16 --cost 0)`)
            setAttrs(character.id, {
                treasure: Math.min(character.treasure + 2, character.treasure_max)
            });
        } else {
            sendChat('QuestCrawl', `<h2>${character.name} leads everyone safely out of the Megabeast's lair (${renderOutcome(outcome)}). You have discovered it's hoard, next time you may steal from it.</h2>`)
        }
    }

    function megabeast(character, who, args) {
        const params = getParams(args, 2);
        if (!canBecomeChampion(who, character)) {
            return
        }
        const commands = [`Challenge ${params.challenge}`, `[Step Down as Champion](!questcrawl --clearchampion ${character.id})`]
        if (params.result) {
            return megabeastResult(character, who, params);
        }
        const output = {
            dice: ['1d6'],
            source: ['hero'],
            label: 'Regular Guidance'
        };
        suitBonus(character, params, output);
        itemBonus('elven-cloak', character, output);
        holyRodBonus(character, output);
        commands.push(`[${output.label} ${output.dice.length}d6]${getChallengeCommandArgs(character, 'megabeast', params, output)}`)
        sendChat('QuestCrawl', `/w ${who} You have chosen to lead your party in your escape from the Megabeast. ${commands.join(' ')}`)
    }

    function claim(character, who, args) {
        const params = getParams(args, 1);
        const fn = state.QuestCrawl[params.claim]
        if (!fn) {
            sendChat('QuestCrawl', `Invalid claim attempted for ${params.claim}.`)
            return;
        }
        return fn(character, who, params.item)
    }

    function tunnel(character, who, args) {
        const params = getParams(args, 2);
        const {mountains, config} = state.QuestCrawl;
        const {mode} = config;
        if (params.destination) {
            if (params.cost > character.treasure) {
                sendChat('QuestCrawl', `/w ${who} You cannot afford to travel the dwarven tunnels.`)
                return;
            }
            const target = mountains[params.destination.split('-').join(' ')]
            const card = grid.get(target)
            if (mode === 'original') {
                getPartyToken().set(toScreenGrid(target, card.cardSize))
            } else if (mode === 'hexagon') {
                getPartyToken().set(toScreenHex(target, card.cardSize))
            }
            state.QuestCrawl.history.push(target)
            if (params.cost) {
                setAttrs(character.id, {
                    treasure: character.treasure - parseInt((params.cost || 0), 10)
                })    
            }
            // move the party to the selected card
            return
        }
        const commands = Object.keys(mountains).map((name) => {
            if (name === params.origin.split('-').join(' ')) {
                return '';
            }
            return `[${name}](!questcrawl --tunnel --destination ${name.split(' ').join('-')} --cost ${params.cost} --origin ${params.origin})`
        })


        sendChat('QuestCrawl', `Select your destination: ${commands.join(' ')}`)
    }

    function map(character, who, args) {
        state.QuestCrawl.config.commands = false
        const params = getNumericParams(args, 1);
        if (character.treasure < params.cost) {
            sendChat('Oracle of the Henge', `/w ${who} You don't posess enough treasure to engage my mystical services. Come back when you do.`)
            return
        }
        sendChat('QuestCrawl', `${character.name} has activated a remote viewing power. Move the Eye token [${params.map}] time on connected unrevealed territories.`)
        setAttrs(character.id, {
            treasure: character.treasure - params.cost
        });
        const partyToken = getPartyToken()
        const farseeingToken = getFarseeingToken()
        partyToken.set({
            layer: 'gmlayer'
        });
        farseeingToken.set({
            layer: 'objects',
            bar2_value: params.map,
            bar2_max: params.map
        })
        state.QuestCrawl.farSightRemaining = params.map

    }

    function characterlog(character, who, args) {
        const logs = state.QuestCrawl.history.reduce((m, logEntry) => {
            (logEntry.events || []).filter(e => (e.content || '').indexOf(character.name) > -1).forEach(e => m.push(e.content))
            return m;
        }, [])
        sendChat('QuestCrawl', `<ol><li>${logs.join('</li><li>')}</li></ol>`)
    }

    on("chat:message", (msg) => {
        const logEntry = (getLastLogEntry() || {});
        logEntry.events = logEntry.events || []
        if ( 'api' !== msg.type || !/^!questcrawl\b/i.test(msg.content)) {
            logEntry.events.push(msg)
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

        logEntry.events.push({player, who, args})

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

        const params = getParams(args, 0);
        if (params.removeitem) {
            deleteRepeatingSectionRow(params.removeitem, character.id)
        }

        if(args.find(n=>/^rabbitsfoot(\b|$)/i.test(n))){
            return rabbitsFootResult(character, who, args);
        }

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

        if(args.find(n=>/^climb(\b|$)/i.test(n))){
            return climb(character, who, args);
        }

        if(args.find(n=>/^hardlands(\b|$)/i.test(n))){
            return hardlands(character, who, args);
        }        

        if(args.find(n=>/^megabeast(\b|$)/i.test(n))){
            return megabeast(character, who, args);
        }

        if(args.find(n=>/^claim(\b|$)/i.test(n))){
            return claim(character, who, args);
        }

        if(args.find(n=>/^tunnel(\b|$)/i.test(n))){
            return tunnel(character, who, args);
        }

        if(args.find(n=>/^look(\b|$)/i.test(n))){
            return look(character, who, args);
        }

        if(args.find(n=>/^map(\b|$)/i.test(n))){
            return map(character, who, args);
        }

        if(args.find(n=>/^bandits(\b|$)/i.test(n))){
            return bandits(character, who, args);
        }        

        if(args.find(n=>/^quest(\b|$)/i.test(n))){
            return quest(character, who, args);
        }

        if(args.find(n=>/^bookofspells(\b|$)/i.test(n))){
            return bookofspells(character, who, args);
        }

        if(args.find(n=>/^holyrod(\b|$)/i.test(n))){
            return holyrod(character, who, args);
        }

        if(args.find(n=>/^vault(\b|$)/i.test(n))){
            return vault(character, who, args);
        }

        if(args.find(n=>/^clearchampion(\b|$)/i.test(n))){
            return clearchampion(character, who, args);
        }

        if(args.find(n=>/^log(\b|$)/i.test(n))){
            return characterlog(character, who, args);
        }
        
        sendChat('QuestCrawl', `/w ${who} <div>Command ${msg.content} not recognized</div>[Help](!questcrawl --help)`)
    });

    on('change:graphic', (obj) => {
        const name = obj.get('name');
        if (name === "Party") {
            checkArtifacts()
            onPartyMoved(grid, obj)
        } else if(name === 'Farseeing Eye') {
            onFarseeingEyeMoved(grid, obj)
        }
    })
})