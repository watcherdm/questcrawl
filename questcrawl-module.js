"use strict";

on("ready", () => {
    const rules = {
        hometown: `<h2>Joker - Hometown</h2>
            <p>When the Party enters a Town, roll one random Magic Item for trade. The Party can trade Treasure (see table). The second Town won’t trade until the Party defeats the <b>City of Thieves.</b></p>
            <pre>
    | Cost | Service / Product |
    | --- | --- |
    | 1 | 10 Supplies |
    | 1 | any Common Item |
    | 1 | Remove 3 Injuries |
    | 3 | Random Magic Item |
            </pre>`,
        strangetown: `<h2>Joker - Hometown</h2>
            <p>When the Party enters a Town, roll one random Magic Item for trade. The Party can trade Treasure (see table). The second Town won’t trade until the Party defeats the <b>City of Thieves.</b></p>
            <pre>
    | Cost | Service / Product |
    | --- | --- |
    | 1 | 10 Supplies |
    | 1 | any Common Item |
    | 1 | Remove 3 Injuries |
    | 3 | Random Magic Item |
            </pre>`,
        goodlands: `<h2>2’s and 6’s - Good Lands</h2>
            <p>Succeed on this <b>Party Challenge</b> to add Supplies equal to the roll. Failure has no cost.</p>`,
        terrible_beasties: `<h2>3’s, 4’s, and 5’s - Terrible Beasties!</h2>
            <p>The player who flipped the card cries out, “Argh, it’s a Terrible Beastie!” Each player describes an aspect of the beast before rolling. Start with the player whose Character’s Suit matches the Beastie; proceed clockwise.</p>
            <h5><i>Example:</i></h5>
            <p>
                P1: “Argh, it’s a Terrible Beastie! It has a Lobster’s Claws!”<br/>
                P2: “Aye, and it hates anything with fingers!”<br/>
                P3: “Aye, and it looks like Willem DaFoe, left in the sun too long!”<br/>
                P4: “Aye, and it owes me money!”<br/>
                All rolling together: “Slay the Beastie!”
            </p>
            <p>Failing this <b>Party Challenge</b> adds 1 Injury. Success adds 1 Treasure and rolls a die. Add one random Common Item on 3 or 4, 1 extra Treasure on 5, and one random Magic Item on 6.`,
        hardlands: `<h2>7’s and 8’s - Hard Lands</h2>
            <p>The landscape is dizzyingly dense - or perhaps vast and featureless. Either way, it’s easy to get lost here. Succeed this <b>Champion Challenge</b> to move next turn. Failure prevents movement; retake the Challenge next turn instead.</p>`,
        crises: `<h2>9’s - Crises</h2>
            <p>♣ Forest Fires ♦ Sandstorms ♥ ️Mudslides ♠ Sinkholes<br/>
            Wherever you are, something can go terribly wrong. When it does, only those who know the Terrain Type best can lead their friends to safety. <b>Champion Challenge</b> of 9. Failure adds 1 Injury to each Character. Only face-down Crises challenge the players; after the first time it’s played it becomes a Blank Territory. Crises flipped by Territory or Item effects are returned face-down.</p>`,
        megabeasts: `<h2>10’s - Megabeast<h2>
            <p>Here be Dragons - or Gigantic Laser-Eyed Crocodile-Moth-Gods. Your choice. Describe the Megabeast as if it were a Terrible Beastie, letting each player go twice.</p>
            <p>Failing this <b>Champion Challenge</b> of 10 adds 2 Injuries to each Character. Success allows the Party to escape uninjured if this card was flipped face-up this turn. Otherwise, the Party steals 2 Treasure, one Magic Item, and one **Weapon of Legend**. Describe the weapon. These Items may only be stolen once per game.</p>`,
        mountains: `<h2>Aces - Mountains</h2>
            <p>Pass a <b>Champion Challenge</b> of 5 or return to the Territory you came from. Success flips all adjacent Territories. Suits don’t give Bonuses on Mountains.</p>
            <p>When the A♠ Mountain is first climbed, add one random Magic Item.</p>`,
        wonders: `<h2>Jacks - Wonders</h2>
            <p><b>J♣ - Oracle of the Henge</b> - Trade 1 Treasure to flip three distant face-down Territories. Trade 3 Treasures to remove the Party’s Injuries.</p>
            <p><b>J♦ - The Vault</b> - If the Party has the <b>Vault Key</b>, Characters add 9 Treasure each. Once looted, the Vault becomes a Blank Territory.</p>
            <p><b>J♥ - Garden of Plenty</b> - Characters add 20 Supplies each. Roll a die. On a 1 or 2, the Garden becomes a Blank Territory.</p>
            <p><b>J♠ - Twisting Pyramid</b> - Trade 1 Treasure to rotate the surrounding Territories either clockwise or counterclockwise.</p>`,
        factions: `<h2>Kings - Factions</h2>
            <p>Players may choose to battle Factions. Factions fight as Challenge 8 Terrible Beasties. At least half of the party (rounded up) must succeed to defeat a Faction. Defeated Factions become Blank Territories. Battled but undefeated Factions always battle. Defeat a Faction to add 5 Treasures and 10 Supplies each.</p>
            <p><b>K♣ - Elves</b> - Trade 1 Treasure for 12 Supplies or 3 Treasures for an <b>Elven Cloak</b>. If you’ve defeated the <b>Dwarves</b>, gain <b>Ancient Knowledge</b>.</p>
            <p><b>K♦ - City of Thieves</b> - Upon entering a connected Territory, roll a <b>Party Challenge</b> of 3. Failure removes 1 Treasure; you’ve been robbed! Trade 4 Treasures for any Magic Item or 9 Treasures for the <b>Pocket Pirate Ship</b>.</p>
            <p><b>K♥ - Dwarves</b> - Counts as a Mountain. Trade 1 Treasure to move to a face-up Mountain or 3 Treasures for an <b>Enchanted Shield</b>. If you’ve defeated the <b>Elves</b>, gain the <b>Dwarven Tunnel Passport</b>.</p>
            <p><b>K♠ - Unearthed Evil</b> - You’ve unleashed an ancient evil! Connected Territories 2-8 fight as Terrible Beasties until the Party defeats the Unearthed Evil.</p>
            <p>The Unearthed Evil always battles; there is no choice. Its Challenge is 12, minus 1 for each time the Twisting Pyramid has been used (minimum 9). Defeating the Unearthed Evil adds one random Magic Item, the **Vault Key**, and the <b>Orb of Chaos</b>.</p>`,
        quests: `<h2>Queens - Quests</h2>
            <p>This is what your Character has been looking for. How do they react? Once they find it, are they done? Or do they owe the Party one last score?</p>
            <ul>
                <li>When a Character reaches the Quest that matches their Suit, they add a second Suit. Do this only once.</li>
                <li>If a Character other than yours has found their Quest, your Character can have 6 Injuries before they are ☠ Dead.</li>
            </ul>
            <p>When all Quests have been achieved, the starting Town becomes the End Beast. Describe it as a Terrible Beastie, adding three details each. Treat it as a Suitless **Faction**, with a Challenge of 10. Only Characters with a **Weapon of Legend** can succeed against the End Beast. Once you’ve entered battle with the End Beast, the Party no longer moves. You must fight or die. Defeat it to win the game!</p>`
        };
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
    
    const rulesKeyTable = {
        "Red": "hometown",
        "Black": "strangetown",
        "Ace": "mountains",
        "Two": "goodlands",
        "Three": "terrible_beasties",
        "Four": "terrible_beasties",
        "Five": "terrible_beasties",
        "Six": "goodlands",
        "Seven": "hardlands",
        "Eight": "hardlands",
        "Nine": "crises",
        "Ten": "megabeasts",
        "Jack": "wonders",
        "Queen": "quests",
        "King": "factions"
    };
    
    
    const commands = {
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
        'Jack of Clubs': (card) => {
            return `
                [Farseeing: 1 Treasure](!questcrawl --map 3) 
                [Heal the Party: 3 Treasure](!questcrawl --heal)`
        },
        'Jack of Spades': (card) => {
            return `
                [Activate Counter-Clockwise](!questcrawl --twist cc --x ${card.x} --y ${card.y}) 
                [Activate Clockwise](!questcrawl --twist c --x ${card.x} --y ${card.y})`
        },
        'Red Joker': (card) => {
            return `[Shop](!questcrawl --shop)`
        },
        'Black Joker': (card) => {
            if ((state.QuestCrawl.factions || {}).city_of_thieves === 2) {
                return `[Shop](!questcrawl --shop)`
            } else {
                return `<h4>I Cannot Trade with you While Those Thieves Remain Active</h4>`
            }
        },
        'King of Hearts': (card) => {
            const comms = []
            if ((state.QuestCrawl.factions || {}).dwarves === 1) {
                comms.push('[Continue Fighting the Dwarves](!questcrawl --challengefaction dwarves)')
            } else {
                comms.push('[Fight the Dwarves](!questcrawl --beastie --suit hearts --challenge 8)')
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
                comms.push('[Buy 12 Supplies: 1 Treasure](!questcrawl --buy --item 20)')
                comms.push('[Buy 1 Elven Cloak: 3 Treasure](!questcrawl --buy --item 10)')
                if ((state.QuestCrawl.factions || {}).dwarves === 2 && !(state.QuestCrawl.artifacts || {}).ancient_knowledge) {
                    comms.push('[Claim Ancient Knowledge](!questcrawl --claimartifact 2)')
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

    function resetConfig() {
        log('resetting configuration')
        if (!state.QuestCrawl) {
            state.QuestCrawl = {
                version: 2.1,
                config: {
                    mode: 'original'
                },
                grid: [],
                day: 0,
                players: {},
                characters: [],
                count: 0,
                factions: {}
            }
        }
        if (Array.isArray(state.QuestCrawl.players)) {
            state.QuestCrawl.players = {};
        }
        if (!state.QuestCrawl.factions) {
            state.QuestCrawl.factions = {};
        }
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
                log(supplies)
                log(injuries)
                supplies.setWithWorker({
                    current: 0
                });
                injuries.setWithWorker({
                    current: character.injuries + 1
                });
            }
        });
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

    function QuestCrawlCard({x, y, id, cardid}) {
        const {mode} = state.QuestCrawl.config;
        this.x = x
        this.y = y
        this.id = id
        this.cardid = cardid
        this.faceup = false


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
                id: this.id
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
        if (!grid.get({x:0,y:0}).id) {
            const ci = cardInfo({type: 'graphic', deckid })
            
            ci.forEach((c) => {
                const gra = getObj('graphic', c.id)
                const car = getObj('card', c.cardid)
                const left = gra.get('left')
                const top = gra.get('top')
                const {x,y} = toCoords(left, top)
                const card = new QuestCrawlCard({x: 0+ x, y : 0 + y, id: c.id, cardid: c.cardid })
                grid.put(card)
            })
        }
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
            inventory_max
        }
    }

    const items = {
        "supplies": {},
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
            name: "Healing Herb",
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
        "elf_supplies": {}
    }

    function getBeastieCommandArgs(params, dice) {
        return `(!questcrawl --beastie --suit ${params.suit} --challenge ${params.challenge} --result ${dice.map(d => `&#91;[${d}]&#93;`).join("|")} --source ${params.source.join('|')})`
    }

    on("chat:message", (msg) => {
        if ( 'api' !== msg.type || !/^!questcrawl\b/i.test(msg.content)) {
            return
        }
        const {mode} = state.QuestCrawl.config;
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
            const {players} = state.QuestCrawl
            const params = args.slice(2).reduce((m, x) => {
                const [key, value] = x.split(' ')
                m[key] = value;
                return m;
            }, {})

            players[params.player] = params.character
            const character = getCharacterJSON(player)
            sendChat('QuestCrawl', `/w ${who} You are playing: <b>[${character.name}](http://journal.roll20.net/character/${character.id})</b>`)
            return
        }

        if(args.find(n=>/^character(\b|$)/i.test(n))) {
            const character = getCharacterJSON(player)
            log(character)
            sendChat('QuestCrawl', `/w ${who} You are playing: <b>[${character.name}](http://journal.roll20.net/character/${character.id})</b>`)
            return
        }

        if(args.find(n=>/^config(\b|$)/i.test(n))){
            const params = args.slice(2).reduce((m, x) => {
                const [key, value] = x.split(' ')
                m[key] = value || !state.QuestCrawl.config[key];
                return m;
            }, {})
            if (Object.keys(params).length === 0) {
                sendChat('QuestCrawl', `/w ${who} ${JSON.stringify(state, null, 2)}`)
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

        if(args.find(n=>/^reset(\b|$)/i.test(n))) {
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
                            state.QuestCrawl.day = 0
                            updateTracker()
                        }, 100)
                    }, 100)
                }, 100)
            }, 100)
            return;
        }
        const character = getCharacterJSON(player);

        if(args.find(n=>/^forage(\b|$)/i.test(n))) {
            const params = args.slice(2).reduce((m, x) => {
                const [key, value] = x.split(' ')
                m[key] = value;
                return m;
            }, {})
            let max = 6;
            let offset = 0;
            if ([character.suit1, character.suit2].indexOf(params.suit) !== -1) {
                max += 5;
                offset += 1;
            }
            if ((state.QuestCrawl.artifacts || {}).ancient_knowledge) {
                max += 5;
                offset += 1;
            }
            result = randomInteger(max) + offset
            if (result >= parseInt(params.challenge, 10)) {
                sendChat('QuestCrawl', `/w ${who} You rolled [[${result}]] and were able to successfully forage ${result} supplies today!`)
                setAttrs(character.id, {
                    supplies: Math.min(character.supplies_max, character.supplies + result)
                });
            } else {
                sendChat('QuestCrawl', `/w ${who} You rolled [[${result}]] and failed to collect any supplies today.`)
            }
            return
        }
        
        if(args.find(n=>/^loot(\b|$)/i.test(n))) {
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
            log(val)
            return
        }

        if(args.find(n=>/^beastie(\b|$)/i.test(n))) {
            const params = args.slice(2).reduce((m, x) => {
                const [key, value] = x.split(' ')
                m[key] = value;
                return m;
            }, {})
            factions = {
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
            if (params.result) {
                const source = params.source.split('|')
                const outcome = params.result.split('|').map(x => parseInt(x, 10)).reduce((m, r, i) => {
                    m.result += r;
                    if (r === 1) {
                        m.b.push(source[i])
                    }
                    return m;
                }, {result: 0, b: []})
                if (outcome.result >= parseInt(params.challenge)) {
                    const treasureMessage = character.treasure === character.treasure_max ? 'You cannot carry anymore <em>Treasure</em>!' : 'You have collected 1 <em>Treasure</em>.'
                    sendChat('QuestCrawl', `/w ${who} You rolled [[${outcome.result}]] and have defeated the <em>Terrible Beastie</em>! ${treasureMessage} [Roll to Loot](!questcrawl --loot &#91;[1d6]&#93;)`)
                    setAttrs(character.id, {
                        treasure: Math.min(character.treasure_max, character.treasure + 1)
                    });
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
                log(outcome)
                return
            }
            log(params)
            let max = 6;
            let offset = 0;
            let dice = ['1d6']
            params.source = ['hero']
            const commands = [`Challenge ${params.challenge}`]
            let label = 'Regular Attack '
            if ([character.suit1, character.suit2].indexOf(params.suit) !== -1) {
                dice.push('1d6')
                params.source.push('suit')
                label += '(with Suit Bonus) '
            }
            commands.push(`[${label} ${dice.length}d6]${getBeastieCommandArgs(params,dice)}`)
            if (character.items.indexOf('Magic Sword') > -1) {
                dice.push('1d6')
                params.source.push('magic-sword')
                commands.push(`[Magic Sword Attack ${dice.length}d6]${getBeastieCommandArgs(params,dice)}`)
                dice.pop()
                params.source.pop()
            }
            if (character.items.indexOf('Weapon of Legend') > -1) {
                dice.push('1d6')
                params.source.push('weapon-of-legend')
                commands.push(`[Weapon of Legend Attack ${dice.length}d6]${getBeastieCommandArgs(params,dice)}`)
                dice.pop()
                params.source.pop()
            }
            if (character.items.indexOf('Magic Sword') > -1 && character.items.indexOf('Weapon of Legend') > -1) {
                dice.push('1d6')
                dice.push('1d6')
                params.source.push('weapon-of-legend')
                params.source.push('magic-sword')
                commands.push(`[Weapon of Legend and Magic Sword Attack ${dice.length}d6]${getBeastieCommandArgs(params,dice)}`)
            }
            sendChat('QuestCrawl', `/w ${who} ${commands.join('<br/>')}`)
            return
        }
        
        if(args.find(n=>/^start(\b|$)/i.test(n))) {
            const players = findObjs({type: 'player'})
            const characters =findObjs({type: 'character'})
            players.forEach((p) => {
                if (p.get('online')) {
                    const c = characters.filter((c) => c.get('controlledby') === p.id)
                    if (!c){
                        sendChat('QuestCrawl', `/w ${p.get('displayname')} [Create A Character](!questcrawl --create)`);
                    } else {
                        sendChat('QuestCrawl', `/w ${p.get('displayname')} <h3>Confirm Your Character</h3><p>Your current characters:</p>`)
                        c.forEach(x => {
                            sendChat('QuestCrawl', `/w ${who} <h4>[${x.get('name')}](http://journal.roll20.net/character/${x.id})</h4> (you can click this link to access the character sheet for editing.)</p> [Play ${x.get('name')}](!questcrawl --confirm --player ${p.id} --character ${x.id}) <hr/>`)
                        })
                        sendChat('QuestCrawl', `/w ${p.get('displayname')} or [Create A new Character](!questcrawl --create)`);
                    }
                }
            })
            return
        }
        

        if(args.find(n=>/^create(\b|$)/i.test(n))) {
            const name = `${who}'s QuestCrawl Character`;
            const {players} = state.QuestCrawl
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

            players[player.id] = character.id

            sendChat('QuestCrawl', `/w ${who} [${name}](http://journal.roll20.net/character/${character.id}) Created, Click to Edit`);
            return
        }
        

        if(args.find(n=>/^help(\b|$)/i.test(n))){
            showHelp(who);
            return;
        }

        if(args.find(n=>/^buy(\b|$)/i.test(n))){
            const params = args.slice(2).reduce((m, x) => {
                const [key, value] = x.split(' ')
                m[key] = parseInt(value, 10);
                return m;
            }, {})
            const character = getCharacterJSON(player)
            if (character.treasure < params.cost) {
                sendChat(`${params.cost === 4 ? 'Rogueish ' : ''}Shop Keep`, `/w ${who} You can't afford that right now, sorry.`)
            } else if (character.items.length >= character.inventory_max) {
                sendChat(`${params.cost === 4 ? 'Rogueish ' : ''}Shop Keep`, `/w ${who} You can't carry any more items.`)
            } else {
                if (params.item === 1 || params.item === 20) {
                    const supplyAmount = params.item === 20 ? 12 : 10;
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
                    treasure: character.treasure - params.cost
                }, {silent: true});
                sendChat('QuestCrawl', `/w ${who} <h3>${items[key].name} was added to your inventory!</h3>`)
            }
            return;
        }

        if(args.find(n=>/^twist(\b|$)/i.test(n))){
            const character = getCharacterJSON(player)
            if (character.treasure < 1) {
                sendChat('QuestCrawl', `The Pyramid requires treasure to function.`)
                return;
            }
            const params = args.slice(2).reduce((m, x) => {
                const [key, value] = x.split(' ')
                m[key] = value;
                return m;
            }, {})
            const dir = args[1].split(' ')[1]
            const {x, y} = params

            let ccPropMap = [
                {y: 1},
                {x: -1},
                {x: -1},
                {y: 1},
                {y: -1},
                {x: 1},
                {x: 1},
                {y: -1}
            ]
            let cPropMap = [
                {x: 1},
                {x: 1},
                {y: 1},
                {y: -1},
                {y: 1},
                {y: -1},
                {x: -1},
                {x: -1}
            ]
            if (mode === 'hexagon') {
                ccPropMap = [
                    {x: -0.5, y: 1},
                    {x: -1},
                    {x: 0.5, y: 1},
                    {x: -0.5, y: -1},
                    {x: 1},
                    {x: 0.5, y: -1},
                ]
                cPropMap = [
                    {x: 1},
                    {x: 0.5, y: 1},
                    {x: 0.5, y: -1},
                    {x: -0.5, y: 1},
                    {x: -0.5, y: -1},
                    {x: -1}
                ]
    
            }
            const pyramid = grid.get({x: parseFloat(x, 10), y: parseFloat(y, 10)})
            const map = dir === 'cc' ? ccPropMap : cPropMap;
            pyramid.getAllNeighbors().map((n) => {
                log(n)
                return grid.get(n)
            }).forEach((ncard, i) => {
                if (ncard.id) {
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
                } else {
                    log('error twisting')
                }
                state.QuestCrawl.evil = Math.min(state.QuestCrawl.evil + 1, 3)
            });
            setAttrs(character.id, {
                treasure: character.treasure - 1
            });
            return;
        }

        if(args.find(n=>/^generate(\b|$)/i.test(n))) {
            
            if(grid.get({x:0,y:0}).cardid) {
                log('Island Already Generated: Reset to Generate Again')
                return;
            }
            
            resetRng();

            const params = args.slice(2).reduce((m, x) => {
                const [key, value] = x.split(' ')
                m[key] = value;
                return m;
            }, {})
            log(`Generate Island called with params ${JSON.stringify(params)}`)

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
            const gapSplit = Math.floor(54 / gaps)
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
            return
        }
        
        let currentMagicItem = null;

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
        
        if(args.find(n=>/^shop(\b|$)/i.test(n))){
            const params = args.slice(2).reduce((m, x) => {
                const [key, value] = x.split(' ')
                m[key] = value;
                return m;
            }, {})
            if (params.type === 'magic') {
                sendChat('Rogueish Shop Keep', `/w ${who} 
                    ${magicItems.map((m) => {
                        return `[Buy 1 ${m.name}: 4 Treasure](!questcrawl --buy --item ${m.id} --cost 4)`;
                    }).join('\n')}
                `);
                
            } else {
                if (currentMagicItem === null) {
                    currentMagicItem = magicItems[Math.floor(rng() * (magicItems.length - 1))]
                }
                sendChat('Shop Keep', `/w ${who} 
                    [Buy 10 Supplies: 1 Treasure](!questcrawl --buy --item 1 --cost 1)
                    [Buy 1 Compass: 1 Treasure](!questcrawl --buy --item 2 --cost 1)
                    [Buy 1 Mountaineering Gear: 1 Treasure](!questcrawl --buy --item 3 --cost 1)
                    [Buy 1 Survival Kit: 1 Treasure](!questcrawl --buy --item 4 --cost 1)
                    [Buy 1 Map: 1 Treasure](!questcrawl --buy --item 5 --cost 1)
                    [Buy 1 Healing Herb: 1 Treasure](!questcrawl --buy --item 6 --cost 1)
                    [Buy 1 Rabbit's Foot: 1 Treasure](!questcrawl --buy --item 7 --cost 1)
                    [Buy 1 ${currentMagicItem.name}: 3 Treasure](!questcrawl --buy --item ${currentMagicItem.id} --cost 3)`);
            }
            return;
        }

        sendChat('QuestCrawl', `/w ${who} <div>Command ${msg.content} not recognized</div>[Help](!questcrawl --help)`)
    });

    function getCommand(name, card) {
        if ((state.QuestCrawl.config || {}).commands) {
            if (commands[name]) return commands[name](card)
        }
        return ''
    }
    
    on('change:graphic', (obj, prev) => {
        if (obj.get("name") === "Party") {
            const left = parseInt(obj.get("left"), 10)
            const top = parseInt(obj.get("top"), 10)
            const coord = toCoords(left, top)
            log(coord)
            const card = grid.get(coord)
            if (card.cardid) {
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
                const handout = findObjs({type: 'handout', name: data.get('name')})[0]
                if (!handout) {
                    const r = rules[rulesKeyTable[data.get('name').split(' ')[0]]]
                    if (r) {
                        sendChat('QuestCrawl',`<div>
                            <h3>${data.get('name')}</h3>
                            <p>${r}<p>
                            <p>${getCommand(data.get('name'), card)}</p>
                        </div>`);
                    }
                    log(`no data found for card ${data.get('name')}`)
                    return
                }
                handout.get("notes", (note) => {
                    sendChat('QuestCrawl',`<div>
                        <img src="${handout.get('avatar')}"/>
                        <h5>${data.get('name')}</h5>
                        <p>${note}<p>
                        <p>${getCommand(data.get('name'), card)}</p>
                    </div>`);
                })
            }
        }
    })
})

