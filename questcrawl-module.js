"use strict";

on("ready", () => {
    
    const cardSize = 70;
    const offset = 1050;
    
    if (! state.QuestCrawl) {
        state.QuestCrawl = {
            version: 2.1,
            config: {
                mode: 'original',
                deck: 'QuestCrawl3',
            },
            grid: {},
            day: 0,
            players: [],
            characters: [],
            
            count: 0
        }
    }
    
    const keyFormat = (s)=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
    
    const lookupDecks = (()=>{
    
        let decks = findObjs({
            type: 'deck'
        }).reduce( (m,d) => (m[d.id]=d) && m, {});
    
        let lookup = Object.keys(decks).reduce( (m,k) => (m[keyFormat(decks[k].get('name'))]=k) && m, {});
    
        on('add:deck',(d)=>{
            decks[d.id]=d;
            lookup[keyFormat(d.get('name'))]=d.id;
        });
    
        on('change:deck',(d,p)=>{
            if(d.get('name') !== p.name){
                delete lookup[keyFormat(p.name)];
                lookup[keyFormat(d.get('name'))]=d.id;
            }
        });
    
        on('destroy:deck',(d)=>{
            delete decks[d.id];
            delete lookup[keyFormat(d.get('name'))];
        });
    
        return (nameFragment) => {
            let key = keyFormat(nameFragment);
            return Object.keys(lookup).filter( k => -1 !== k.indexOf(key)).map(k => decks[lookup[k]]);
        };
    })();
    
    
    const getPageForPlayer = (playerid) => {
        let player = getObj('player',playerid);
        if(playerIsGM(playerid)){
            return player.get('lastpage');
        }
    
        let psp = Campaign().get('playerspecificpages');
        if(psp[playerid]){
            return psp[playerid];
        }
    
        return Campaign().get('playerpageid');
    };
    
    
    const lookupCards = (()=>{

        let cards = findObjs({
            type: 'card'
        }).reduce( (m,c) => {
            let did = c.get('deckid');
            m[did] = m[did]||{};
            m[did][c.id]=c;
            return m;
        },{});

        let lookup = Object.keys(cards).reduce( (memo, did) => {
            memo[did]=Object.keys(cards[did]).reduce( (m,k) => (m[keyFormat(cards[did][k].get('name'))]=k) && m, {});
            return memo;
        },{});

        on('add:card',(c)=>{
            if('card'===c.get('type')){
                let did = c.get('deckid');
                cards[did] = cards[did]||{};
                cards[did][c.id]=c;
                lookup[did]=lookup[did]||{};
                lookup[did][keyFormat(c.get('name'))]=c.id;
            }
        });

        on('change:card',(c,p)=>{
            if('card'===c.get('type') && c.get('name') !== c.name){
                let did = c.get('deckid');
                delete lookup[did][keyFormat(p.name)];
                lookup[did][keyFormat(c.get('name'))]=c.id;
            }
        });

        on('destroy:card',(c)=>{
            if('card'===c.get('type')){
                let did = c.get('deckid');
                delete cards[did][c.id];
                delete lookup[did][keyFormat(c.get('name'))];
            }
        });

        return (deckid, nameFragment) => {
            let key = keyFormat(nameFragment);
            return Object.keys(lookup[deckid]).filter( k => -1 !== k.indexOf(key)).map(k => cards[deckid][lookup[deckid][k]]);
        };
    })();

    const isCleanImgsrc = (imgsrc) => /(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/.test(imgsrc);

	const getCleanImgsrc = (imgsrc) => {
		let parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);
		if(parts) {
			return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
		}
		return;
	};

    const fixedPlayCardToTable = (cardid, options) => {
        let card = getObj('card',cardid);
        if(card){
            let deck = getObj('deck',card.get('deckid'));
            if(deck){
                if(!isCleanImgsrc(deck.get('avatar')) && !isCleanImgsrc(card.get('avatar'))){
                    // marketplace-marketplace:
                    playCardToTable(cardid, options);
                } else if (isCleanImgsrc(deck.get('avatar')) && isCleanImgsrc(card.get('avatar'))){
                    let pageid = options.pageid || Campaign().get('playerpageid');
                    let page = getObj('page',pageid);
                    if(page){

                        let imgs=[getCleanImgsrc(card.get('avatar')),getCleanImgsrc(deck.get('avatar'))];
                        let currentSide = options.hasOwnProperty('currentSide')
                            ? options.currentSide
                            : ('faceup' === deck.get('cardsplayed')
                                ? 0
                                : 1
                            );

                        let width = options.width || parseInt(deck.get('defaultwidth')) || 140;
                        let height = options.height || parseInt(deck.get('defaultheight')) || 210;
                        let left = options.left || (parseInt(page.get('width'))*70)/2;
                        let top = options.top || (parseInt(page.get('height'))*70)/2;

                        createObj( 'graphic', {
                            subtype: 'card',
                            cardid: card.id,
                            pageid: page.id,
                            currentSide: currentSide,
                            imgsrc: imgs[currentSide],
                            sides: imgs.map(i => encodeURIComponent(i)).join('|'),
                            left,top,width,height,
                            layer: 'objects',
                            isdrawing: true,
                            controlledby: 'all',
                            gmnotes: `cardid:${card.id}`
                        });
                    } else {
                        sendError('gm',`Specified pageid does not exists.`);
                    }
                } else {
                    sendError('gm',`Can't create cards for a deck mixing Marketplace and User Library images.`);
                }
            } else {
                sendError('gm',`Cannot find deck for card ${card.get('name')}`);
            }
        } else {
            sendError('gm',`Cannot find card for id ${cardid}`);
        }
    };

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

    const sendError = (who, msg) => sendChat('',`/w "${who}" ${f.msg(msg)}`);


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
    
    QuestCrawlCard.prototype = {
        getCoordString: function(){return `${this.x},${this.y}`},
        getRandomNeighbor: function(){
            let {x, y} = this;
            const n = this.neighbors[Math.floor(Math.random() * 7)];
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

    function getRandomPlacedCard() {
        return open[Math.floor(Math.random() * (open.length - 1))];
    }

    function toCoords(left, top) {
        return {x: (left - offset - (cardSize / 2)) / cardSize , y: (top - offset - (cardSize / 2)) / cardSize}
    }

    function detectGameState() {
        const currentDeck = lookupDecks("QuestCrawl3")[0]
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

    on("chat:message", (msg) => {
        if ( 'api' !== msg.type || !/^!questcrawl\b/i.test(msg.content)) {
            return
        }
        
        let who = (getObj('player', msg.playerid) || {get:()=>'API'}).get('_displayname');
        let pageid = getPageForPlayer(msg.playerid);
        
        let args = processInlinerolls(msg)
            .replace(/<br\/>\n/g, ' ')
            .replace(/(\{\{(.*?)\}\})/g," $2 ")
            .split(/\s+--/);

        const currentDeck = lookupDecks("QuestCrawl3")[0]
        const deckid = currentDeck.id
        if(args.find(n=>/^reset(\b|$)/i.test(n))) {
            grid = new Grid()
            placed = []
            open = []
            setTimeout(() => {
                recallCards(deckid)
                setTimeout(() => {
                    shuffleDeck(deckid)
                    setTimeout(() => {
                        recallCards(deckid)
                        setTimeout(() => {
                            shuffleDeck(deckid)
                            log("cards reset")
                        }, 1000)
                    }, 1000)
                }, 1000)
            }, 1000)
            return;
        }

        if(args.find(n=>/^help(\b|$)/i.test(n))){
            showHelp(who);
            return;
        }
        
        if(args.find(n=>/^generate(\b|$)/i.test(n))) {
            const startingTown = lookupCards(deckid, "Red Joker")[0]
            drawCard(deckid, startingTown.id)
            const scard = new QuestCrawlCard({x: 0, y: 0, cardid: startingTown.id})
    
            scard.place(true)
            
            const l = findObjs({type: 'graphic', cardid: startingTown.id})[0]
            scard.id = l.id
            while (placed.length < 54) {
                const cardid = drawCard(deckid)
                if (cardid === false || cardid.indexOf('-') !== 0) {
                    log(cardid)
                    log(open)
                    break;
                }
                let target = grid.get(getRandomPlacedCard().getRandomNeighbor());
                while (target.id) {
                    target = grid.get(getRandomPlacedCard().getRandomNeighbor());
                }
                const card = new QuestCrawlCard({x: target.x, y: target.y, cardid: cardid})
                card.place()
                const l = findObjs({type: 'graphic', cardid: cardid})[0]
                card.id = l.id
            }
        }
    })
    
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
                    log(`no data found for card ${data.get('name')}`)
                    return
                }
                handout.get("notes", (note) => {
                    sendChat('QuestCrawl',`<div>
                        <h1>${data.get('name')}</h1>
                        <img src="${handout.get('avatar')}"/>
                        <p>${note}<p>
                    </div>`);
                })
            }
        }
    })
})

