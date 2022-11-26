"use strict";

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


on("ready", () => {
    let rng = Math.random;
    const cardSize = 70;
    const offset = 1050;

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
            return `[Farseeing: 1 Treasure](!questcrawl --map 3) [Heal the Party: 3 Treasure](!questcrawl --heal)`
        },
        'Jack of Spades': (card) => {
            return `[Activate Counter-Clockwise](!questcrawl --twist cc --x ${card.x} --y ${card.y}) [Activate Clockwise](!questcrawl --twist c --x ${card.x} --y ${card.y})`
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
                comms.push('[Fight the Dwarves](!questcrawl --challengefaction dwarves)')
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
            const comms = []
            if ((state.QuestCrawl.factions || {}).city_of_thieves === 1) {
                comms.push('[Continue Fighting the City of Thieves](!questcrawl --challengefaction city_of_thieves)')
            } else {
                comms.push('[Fight the City of Thieves](!questcrawl --challengefaction city_of_thieves)')
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
                comms.push('[Continue Fighting the Elves](!questcrawl --challengefaction elves)')
            } else {
                comms.push('[Fight the Elves](!questcrawl --challengefaction elves)')
                comms.push('[Buy 12 Supplies: 1 Treasure](!questcrawl --buy --item 14)')
                comms.push('[Buy 1 Elven Cloak: 3 Treasure](!questcrawl --buy --item 10)')
                if ((state.QuestCrawl.factions || {}).dwarves === 2 && !(state.QuestCrawl.artifacts || {}).ancient_knowledge) {
                    comms.push('[Claim Ancient Knowledge](!questcrawl --claimartifact 2)')
                }
            }
            return comms.join('\n')
        },
        'King of Spades': (card) => {
            const comms = []
            if ((state.QuestCrawl.factions || {}).unearthed_evil === 1) {
                comms.push('[Continue Fighting the Unearthed Evil](!questcrawl --challengefaction unearthed_evil)')
            } else {
                comms.push('[Fight the Unearthed Evil](!questcrawl --challengefaction unearthed_evil)')
            }
            return comms.join('\n')
        }

    }

    function resetConfig() {
        if (!state.QuestCrawl) {
            state.QuestCrawl = {
                version: 2.1,
                config: {
                    mode: 'original'
                },
                grid: {},
                day: 0,
                players: [],
                characters: [],
                count: 0
            }
        }
    }

    resetConfig()
    
    function resetRng() {
        if (state.QuestCrawl.config.seed) {
            log(`setting rng to mulberry with seed ${state.QuestCrawl.config.seed}`)
            const seed = cyrb128(state.QuestCrawl.config.seed)
            rng = mulberry32(seed[0])
        } else {
            rng = Math.random
        }
    }

    function endTurn() {
        state.QuestCrawl.grid = grid.toJSON()
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

    const showHelp = () => {
        log("we could all certainly use a little help!")
    }

    const sendError = (who, msg) => sendChat('QuestCrawl',`/w "${who}" ${msg}`);


    function Grid() {
        this.internal = {}
    }
    
    Grid.prototype = {
        get: function({x, y}) {
            return this.internal[`${x},${y}`] || {x,y};
        },
        put: function(card) {
            this.internal[card.getCoordString()] = card;
        },
        toJSON: function() {
            return Object.keys(this.internal).reduce((m, coord) => {
                m[coord] = this.internal[coord].toJSON()
                return m
            }, {})
        }
    }

    let placed = []
    let open = []
    let grid = new Grid()

    function QuestCrawlCard({x, y, id, cardid}) {
        this.x = x
        this.y = y
        this.id = id
        this.cardid = cardid
        this.neighbors = [
            {x:-1,y:-1},{x:-1,y:0},{x:-1,y:1}, 
            {x:0,y:-1},{x: 0, y: 1},
            {x:1,y:-1},{x: 1, y: 0},{x:1,y:1}
        ];
    }
    
    function GapCard({x, y}) {
        this.x = x
        this.y = y
        this.id = 'Gap'
        this.cardid = 'Lake'
    }

    GapCard.prototype = {
        getCoordString: function(){return `${this.x},${this.y}`},
        getRandomNeighbor: function(){
            let {x, y} = this;
            const n = this.neighbors[Math.floor(rng() * 7)];
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
        getCoordString: function(){return `${this.x},${this.y}`},
        getRandomNeighbor: function(){
            let {x, y} = this;
            const n = this.neighbors[Math.floor(rng() * 7)];
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
        place: function(faceUp = false){
            playCardToTable(this.cardid, {
                left: offset + (this.x * cardSize) + cardSize/2,
                top: offset + (this.y * cardSize) + cardSize/2,
                currentSide: faceUp ? 0 : 1
            });
            grid.put(this)
            placed.push(this)
            open.push(this)
        },
        toJSON: function() {
            return {
                x: this.x,
                y: this.y,
                cardid: this.cardid,
                id: this.id
            }
        }
    }

    function getRandomOpenCard() {
        return open[Math.floor(rng() * (open.length - 1))];
    }

    function toCoords(left, top) {
        return {x: (left - offset - (cardSize / 2)) / cardSize , y: (top - offset - (cardSize / 2)) / cardSize}
    }

    function detectGameState() {
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
                const card = new QuestCrawlCard({x, y, id: c.id, cardid: c.cardid })
                grid.put(card)
            })
        }
    }

    detectGameState()

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

    on("chat:message", (msg) => {
        if ( 'api' !== msg.type || !/^!questcrawl\b/i.test(msg.content)) {
            return
        }

        let player = getObj('player', msg.playerid);
        let who = (player || {get:()=>'API'}).get('_displayname');

        let args = processInlinerolls(msg)
            .replace(/<br\/>\n/g, ' ')
            .replace(/(\{\{(.*?)\}\})/g," $2 ")
            .split(/\s+--/);

        if(args.find(n=>/^resetconfig(\b|$)/i.test(n))) {

            sendError(who, `Resetting Mod to Factory Default`)
            delete state.QuestCrawl
            resetConfig()
            return

        }

        if(args.find(n=>/^config(\b|$)/i.test(n))){
            const params = args.slice(2).reduce((m, x) => {
                const [key, value] = x.split(' ')
                m[key] = value;
                return m;
            }, {})
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
                        }, 100)
                    }, 100)
                }, 100)
            }, 100)
            return;
        }
        
        if(args.find(n=>/^start(\b|$)/i.test(n))) {
            const players = findObjs({type: 'player'})
            const characters =findObjs({type: 'character'})
            players.forEach((p) => {
                if (p.get('online')) {
                    const c = characters.find((c) => c.get('controlledby') === p.id)
                    if (!c){
                        sendChat('QuestCrawl', `/w ${who} [Create A Character](!questcrawl --create)`);
                    } else {
                        const name = c.get('name');
                        sendChat('QuestCrawl', `/w ${who} <h3>Confirm Your Character</h3><p>You are currently playing [${name}](http://journal.roll20.net/character/${c.id}) (you can click this link to access the character sheet for editing.)</p><hr/> [Yup](!questcrawl --confirm) [Nope](!questcrawl --deny)`)
                        log(c)
                    }
                }
            })
            return
        }
        
        if(args.find(n=>/^create(\b|$)/i.test(n))) {
            const name = `${who}'s QuestCrawl Character`;
            const character = createObj('character', {
                name,
                inplayerjournals: "all",
                controlledby: player.id
            })
            sendChat('QuestCrawl', `/w ${who} [${name}](http://journal.roll20.net/character/${character.id}) Created, Click to Edit`);
            return
        }
        

        if(args.find(n=>/^help(\b|$)/i.test(n))){
            showHelp(who);
            return;
        }

        if(args.find(n=>/^twist(\b|$)/i.test(n))){
            const dir = args[1].split(' ')[1]
            if (dir === "cc") {
                log(`${dir} twist counterclockwise`)
            } else if (dir === 'c') {
                log(`${dir} twist clockwise`)
            } else {
                log(`invalid twist direction ${dir}`)
            }
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
                sendChat('QuestCrawl', `/w ${who} 
                    ${magicItems.map((m) => {
                        return `[Buy 1 ${m.name}: 4 Treasure](!questcrawl --buy --item ${m.id} --from thieves)`;
                    }).join('\n')}
                `);
                
            } else {
                if (currentMagicItem === null) {
                    currentMagicItem = magicItems[Math.floor(rng() * (magicItems.length - 1))]
                }
                sendChat('QuestCrawl', `/w ${who} 
                    [Buy 10 Supplies: 1 Treasure](!questcrawl --buy --item 1)
                    [Buy 1 Compass: 1 Treasure](!questcrawl --buy --item 2)
                    [Buy 1 Mountaineering Gear: 1 Treasure](!questcrawl --buy --item 3)
                    [Buy 1 Survival Kit: 1 Treasure](!questcrawl --buy --item 4)
                    [Buy 1 Map: 1 Treasure](!questcrawl --buy --item 5)
                    [Buy 1 Healing Herb: 1 Treasure](!questcrawl --buy --item 6)
                    [Buy 1 Rabbit's Foot: 1 Treasure](!questcrawl --buy --item 7)
                    [Buy 1 ${currentMagicItem.name}: 3 Treasure](!questcrawl --buy --item ${currentMagicItem.id})`);
            }
            return;
        }

        sendChat('QuestCrawl', `/w ${who} <div>Command ${msg.content} not recognized</div>[Help](!questcrawl --help)`)
    });

    function getCommand(name, card) {
        if (commands[name]) return commands[name](card)
        return ''
    }
    
    on('change:graphic', (obj, prev) => {
        if (obj.get("name") === "Party") {
            const left = parseInt(obj.get("left"), 10)
            const top = parseInt(obj.get("top"), 10)
            const coord = {x: (left - offset - (cardSize / 2)) / cardSize , y: (top - offset - (cardSize / 2)) / cardSize}
            const card = grid.get(coord)
            if (card.cardid) {
                card.place(true)
                const data = getObj('card', card.cardid)
                const handout = findObjs({type: 'handout', name: data.get('name')})[0]
                if (!handout) {
                    const r = rules[rulesKeyTable[data.get('name').split(' ')[0]]]
                    if (r) {
                        sendChat('QuestCrawl',`<div>
                            <h1>${data.get('name')}</h1>
                            <p>${r}<p>
                            <p>${getCommand(data.get('name'), card)}</p>
                        </div>`);
                    }
                    log(`no data found for card ${data.get('name')}`)
                    return
                }
                handout.get("notes", (note) => {
                    sendChat('QuestCrawl',`<div>
                        <h1>${data.get('name')}</h1>
                        <img src="${handout.get('avatar')}"/>
                        <p>${note}<p>
                        <p>${getCommand(data.get('name'), card)}</p>
                    </div>`);
                })
            }
        }
    })
})

