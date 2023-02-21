const REMAINS_LOWER = "and, as, as, at, but, by, if, for, from, in, into, like, near, now, nor, of, off, on, once, onto, or, out, over, past, so, than, that, the, till, to, up, upon, with, when, yet".split(', ');

String.prototype.titleCase = function() {
    let splitString = this.toLowerCase().split(' ');
    let output = [];

    splitString.forEach((el, i, array) => {
        if (i === 0 || i === (array.length - 1) || REMAINS_LOWER.indexOf(el) === -1) {
            output.push(el.charAt(0).toUpperCase() + splitString[i].substring(1));
        } else {
            output.push(el);
        }
    });
    return output.join(' ');
}

//Creates a trie node
class TrieNode {
    constructor() {
        this.children = {};
        this.last = false;
    }
}
 
//Makes a trie to be traversed and used in search
class Trie {
    constructor() {
    	this.root = new TrieNode()
    }
 
	formTrie = function(keys) {
        keys.forEach(key => this.insert(key)); 
    }
 
    insert = function(key) {
		let node = this.root;
 
        key.split("").forEach(a => {
        	a = a.toLowerCase();
            if (!node.children.hasOwnProperty(a)) {
                node.children[a] = new TrieNode();
            }
            node = node.children[a];
        })

        node.last = true;
 
    }
        
    suggestionsRec = function(node, word) {
        if (node.last) {
           cardInput.suggestions.update(word);
        }
 
 		let n = null

        Object.keys(node.children).forEach(a => {
        	n = node.children[a];
            this.suggestionsRec(n, word + a);
        });
    }
 
    listSuggestions = function(key) {
        let node = this.root;
        cardInput.suggestions.remove();
        cardInput.suggestions.reveal();

        key.split("").forEach(a => {
        	a = a.toLowerCase();
            if (!node.children.hasOwnProperty(a)) {
                return 0;
            }
            node = node.children[a];
        });
        if (!node.children) {
            return -1;
        }
 
        this.suggestionsRec(node, key);
        return 1;
    }
}


//------split off quantity when numbers end
//----------new div for quant and remove from old

//event listener for 'enter'
//---create new box and get details for previous


class CardInput {
    constructor(el) {
        this.inputBox = document.createElement('input');
        this.foilCheck = document.createElement('input');
        this.inputBox.classList.add('card_name');
        this.foilCheck.classList.add('foil');
        this.foilCheck.type = 'checkbox';
        this.container = document.createElement('div');
        this.container.classList.add('card_box');
        this.suggestions = new Suggestions();
        this.inputBox.placeholder = "qty and card name";
        this.container.append(this.inputBox);
        this.container.append(this.foilCheck);
        this.element = el;
        this.element.append(this.container);
        return this;
    }

    selectQuantity(lastChar) {
        this.valueArray = this.inputBox.value.split("");
        this.digitKey = "0123456789".split("");
        this.quantity = "";
        this.valueArray.forEach(char => {
            if (this.digitKey.indexOf(char) !== -1) {
                this.quantity += char; 
            } else {
                this.square = document.createElement('input');
                this.square.id = 'quantity';
                this.square.value = this.quantity;
                this.square.type = "number";
                this.container.prepend(this.square);
                if (lastChar) this.element.getElementsByClassName("card_name")[0].value = lastChar;
                else this.element.getElementsByClassName("card_name")[0].value = "";
            }
        });
        NEED_QUANTITY = false
        this.details = {}
    }

    select = function() {
        this.details['name'] = document.getElementById(this.suggestions.selectionIndex.toString()).innerHTML
        this.details['quantity'] = document.getElementById('quantity').value;
        this.details['multiverse_ids'] = IDS[this.details.name];
        this.card = new Card(this.details);
        let input = this.inputBox;
        input.parentElement.parentElement.insertBefore(this.card, input.parentElement);
        this.square.remove();
        this.inputBox.value = "";
        this.suggestions.remove();
        NEED_QUANTITY = true;
    }
}

class Card {
    constructor(details) {
        this.name = details['name'];
        this.quantity = details['quantity'];
        this.div = document.createElement('div');
        this.div.classList.add('card');
        console.log(details['multiverse_ids'])
        this.div.id = details['multiverse_ids'][details['multiverse_ids'].length -1].toString();
        this.cost = COSTS[this.name];
        this.sets = SETS[this.name];
        this.right_side = document.createElement('span');
        this.right_side.innerHTML = this.sets[0].toUpperCase() + " " + this.cost;
        this.right_side.classList.add('right_side')
        this.div.append(this.quantity);

        this.div.innerHTML = this.quantity + " " + this.name;
        this.div.append(this.right_side);
        this.borderColor = this.getBorderColor()
        this.div.classList.add(this.borderColor);
        
        this.manaCost = getManaCost();
        for symbol in this.manaCost():
            //add symbol to card
        this.div.addEventListener("mouseenter", showCard)
        this.div.addEventListener("mouseout", poofCard)  

        return this.div;     
    }

    getBorderColor = function() {  
        const costKey = {'W': 'white',
                         'U': 'blue',
                         'G': 'green',
                         'B': 'black',
                         'R': 'red'};

        // let numbers = this.cost.split("").filter(number => number.match(/[0-9]*/))
        let symbols = this.cost.split("").filter(symbol => symbol.match(/W|U|B|R|G/));
        let firstSymbol = symbols.length > 0 ? symbols[0] : false;
        let lastSymbol = symbols[symbols.length -1];
        if (symbols && symbols.length > 1 && firstSymbol !== lastSymbol) {
            return 'multicolor';
        } else if (symbols && symbols.length === 1 || costKey.hasOwnProperty(firstSymbol) && firstSymbol === lastSymbol) {
            return costKey[firstSymbol];
        } else {
            return 'colorless';
        }
    }

    getManaCost = function() {
        let symbol = this.cost.split("").filter(symbol => symbol !== '{' && symbol !== '}');
        return symbol;
    }
}


class Suggestions {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'suggestions';
        this.options = [];
        this.visibleQuantity = 0;
        this.selectionIndex = 1;
        container.append(this.container);

        return this;
    }

    remove = function() {
        this.visibleQuantity = 0;
        this.container.remove();
        this.container = document.createElement('div');
        this.container.id = "suggestions"
        // this.list.forEach(suggestion => {
        //     var el = document.createElement('div');
        //     el.innerHTML = suggestion;
        //     this.container.append(el);
        // });
        this.selectionIndex = 1;
        document.body.append(this.container);
        return this;
    }

    reveal = function() {
        this.container.classList.add("active");
    }

    update = function(word) {
        if (this.visibleQuantity < 10) {
            this.visibleQuantity += 1
            let element = document.createElement('div');
            element.id = this.visibleQuantity;
            element.innerHTML = word.titleCase();
            document.getElementById('suggestions').append(element);
        }
    }

    moveSelector = function(direction) {
        let modifier = 0
        if (direction === "up" && (this.selectionIndex > 1)) {
            modifier = -1;
        } else if (direction === "down" && (this.selectionIndex < this.visibleQuantity)) {
            modifier = 1;
        } else {
            modifier = 0;
        }

        this.prevSelectionIndex = this.selectionIndex;
        this.selectionIndex += modifier;

        if (this.prevSelectionIndex > 0) {
            let unactive = document.getElementById(this.prevSelectionIndex.toString());
            unactive.classList.remove('active');
        }
        if (this.visibleQuantity > 0 && this.selectionIndex >= 1) {
            let active = document.getElementById(this.selectionIndex.toString());
            active.classList.add('active');
        } 

        
    }
}

function showCard(event) {
    let cardVisual = document.createElement("img");
    cardVisual.style.borderRadius = "10px";
    cardVisual.style.width = "300px"
    cardVisual.id = "visualizer"
    cardVisual.src = "https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=" + event.target.id + "&type=card";
    event.target.insertAdjacentElement("afterend", cardVisual);
}

function poofCard(event) {
    document.getElementById('visualizer').remove();
}

function onReaderLoad(event){
    let obj = JSON.parse(event.target.result);
    keys = cardInput.suggestions.options;
    for(let i = 0; i < obj.length; i += 1) {
        el = obj[i];
        keys.push(el["name"]);
        COSTS[el["name"]] = el["mana_cost"];
        if (!Array.isArray(SETS[el["name"]])) {
            SETS[el["name"]] = [];
        }
        SETS[el["name"]].push(el["set"]);;
        if (!Array.isArray(IDS[el["name"]])) {
            IDS[el["name"]] = [];
        }
        el["multiverse_ids"].forEach(id => {
            if (id !== undefined) {
                IDS[el["name"]].push(id);
            }
        });
        console.log(el["set"])
        console.log(Math.round((i/78860) * 100));
    };
    document.getElementById('file').remove();
    trie.formTrie(keys);
}

function onChange(event) {
    var reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(event.target.files[0]);
}

function onType(event) {
    let input = event.target.value.split("");
    let lastChar = input[input.length -1];
    let digitsKey = "0123456789".split("");

    if (NEED_NUM) {
        if (digitsKey.indexOf(lastChar) !== -1) NEED_NUM = false;
        else console.error("Please enter a quantity");
    } else {
        if (digitsKey.indexOf(lastChar) !== -1) {
        } else if (NEED_QUANTITY) {
            if (lastChar === ' ' || lastChar === '  ' || lastChar === 'x' || lastChar === 'X'){
                cardInput.selectQuantity();
            } else {
                cardInput.selectQuantity(lastChar);
            }
        } else {
            trie.listSuggestions(input.join(""));
            cardInput.suggestions.moveSelector();
        }
    }
}

function onEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        cardInput.select();
    }
}

function onKey(event) {
    if (event.key === "ArrowUp") {
        event.preventDefault();
        cardInput.suggestions.moveSelector("up");
    }
    if (event.key === "ArrowDown") {
        event.preventDefault()
        cardInput.suggestions.moveSelector("down");
    }
 }

function main() {
    //global card variables with their corresponding data
    const suggestions = document.getElementById('suggestions');
    const fileUpload = document.getElementById('file');

    //add event listeners to box
    cardInput.container.addEventListener('keydown', onKey);
    cardInput.container.addEventListener('keypress', onEnter);
    cardInput.container.addEventListener('input', onType);
    fileUpload.addEventListener('change', onChange);
}





let container = document.getElementById("card_input_container")
let cardInput = new CardInput(container);
let NEED_NUM = true;
let NEED_QUANTITY = true;
let COSTS = {};
let SETS = {};
let IDS = {}
let trie = new Trie();

//MAIN
main();