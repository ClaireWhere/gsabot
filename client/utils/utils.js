function getRandomName() {
    if (Math.random() > 0.99) {
        const evilNames = ["Ḛ̷͇̪͇̑̉", "Ė̷̡̡̧̟͕̞̱͙̥̱̥̬̬̲̭̟̮̮̯̪̺͙͚̑̈̊̓͋̈́̒͌́͆̕̚ͅ", "Ȩ̵̢̨̡̢̧̢̛͇̮͉͎̘̳̠͉̦̦̝͓̳͓̰̤̹̼̩̥̪̖̥͙͈͖͖̖̙̬͖̺̫͖̻̖̳̪̗͍̳͖̪̖͕̝̳͓̦̼̗̦̦̤̪̬͓̲͎͉̻̘̠͓̹͖͙̞́̈́͊͑̏̑͐̂͊̅̀̋̀̍͗͊̾̑͑̆͑̽̉̈́̊̈̀́͋͐͌̅̃̌̏̉̾͐͊̉̒͗̈́̿̅́̋̈̓̑́͗̈́́̽̀͆̊̂̑͆͘͘͘̚̚͘͜͝͝ͅͅ", "Ě̴̡̧̢͎̟̞̱̹͈͍͖̦̪͚͓͕̖̦͎̤̦̹͓̤͎͖̱̣̜͕̞͍̮̱̳̣̭̣͈̯̦̤̬̂̃͐̏ͅ"];
        const evilIndex = Math.floor(Math.random() * evilNames.length);
        return evilNames[evilIndex];
    }
    const names = [
        "Sexuality And Gender Entity",
        "Sexuality And Gender Enterprise",
        "Sexuality And Gender Extra",
        "Sexuality And Gender Etc.",
        "Sexuality And Gender Everywhere",
        "Sexuality And Gender for Everyone",
        "Sexuality And Gender Establishment",
        "Sexuality And Gender EVERYWHERE",
        "Sexuality And Gender on Earth",
        "Sexuality And Gender Enjoyers",
        "Sexuality And Gender Enjoyers",
        "Sexuality And Gender Extravaganza",
        "Sexuality And Gender Enhanced",
        "Sexuality And Gender EXTREME",
        "Sexuality And Gender Empire",
        "Sexuality And Gender Ecosystem",
        "Sexuality And Gender Engagement",
        "Sexuality And Gender Engaged",
        "Sexuality And Gender Engagers",
        "Sexuality And Gender Everyday",
        "Sexuality And Gender Enthusiasts",
        "Sexuality And Gender Ensemble",
        "Sexuality And Gender Emporium",
        "Sexuality And Gender Exchange",
        "Sexuality And Gender Experience",
        "Sexuality And Gender Experiencers",
        "Sexuality And Gender Exploration",
        "Sexuality And Gender Explorers",
        "Sexuality And Gender Extravaganza",
        "Sexuality And Gender Excessively",
        "Sexuality And Gender Excitement",
        "Sexuality And Gender Everything",
        "Sexuality And Gender Existence",
        "Sexuality And Gender Exists",
        "Sexuality And Gender Evolution",
        "Sexuality And Gender Evolved",
        "Sexuality And Gender Endless",
        "Sexuality And Gender Emergence",
        "Sexuality And Gender Emerged",
        "Sexuality And Gender Endgame",
        "Sexuality And Gender Enormous",
        "Sexuality And Gender Elevated",
        "Sexuality And Gender Entourage",
        "Sexuality And Gender Experts",
        "Sexuality And Gender Encouraged",
        "Sexuality And Gender Encouragers",
        "Sexuality And Gender Expansion",
        "Sexuality And Gender Escape",
        "Sexuality And Gender Entertainment",
        "Sexuality And Gender Eternal",
        "Sexuality And Gender Eternity",
        "Sexuality And Gender Entirely",
        "Sexuality And Gender Endeavor",
        "Sexuality And Gender Empowerers",
        "Sexuality And Gender Empowered",
        "Sexuality And Gender Empowerment",
        "Sexuality × Gender = ???"
    ];
    const i = Math.floor(Math.random() * names.length);
    return names[i];
}

/**
 * 
 * @param {Array} a 
 * @param {Array} b 
 * @returns {boolean}
 * @example
 * ```js
 * arrayMatch([1, 5, 3], [1, 3, 5]); // returns true
 * arrayMatch([1, 3, 3], [1, 3, 5]); // returns false
 * arrayMatch([], []); // returns true
 * arrayMatch([], undefined); // returns false
 * ```
 */
function arrayMatch(a, b) {    
    if (isEmpty(a) && isEmpty(b)) { return true; }
    if (a === undefined || b === undefined || a.length != b.length ) { return false; }
    return a.every(x => b.includes(x)) && b.every(x => a.includes(x));
}

/**
 * 
 * @param {Object} obj 
 * @returns {boolean}
 * @example
 * ```js
 * isEmpty({}); // returns true
 * isEmpty(undefined); // returns true
 * isEmpty([]); // returns true
 * isEmpty(1); // returns true
 * 
 * isEmpty({"property": 1}); // returns false
 * isEmpty([{}]); // returns false
 * isEmpty("1"); // returns false
 * ```
 */
function isEmpty(obj) {
    if (obj === undefined) { return true; }
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}

/**
 * 
 * @param {Array} arr 
 * @returns {string} a comma separated string of arr
 * @example
 * ```js
 * formatList(['a','b','c']); // returns 'a, b, and c'
 * formatList(['a','b']); // returns 'a and b'
 * formatList(['a']); // returns 'a'
 * ```
 */
function formatList(arr) {
    if (arr === undefined) { return undefined; }
    if (arr.length <= 1) { return arr.shift(); }
    const separator = arr.length > 2 ? ', ' : ' ';
    var formattedList = ``;
    const lastElement = arr.pop();
    arr.forEach(element => {
        formattedList += `${element}${separator}`;
    });
    formattedList += `and ${lastElement}`;
    return formattedList;
}

/**
 * Returns an array containing all elements of 'search' that do not intersect with 'intersection'
 * @param {Array | string} search 
 * @param {Array | string} intersection
 * @returns {Array}
 */
function removeIntersection(search, intersection) {
    if ((typeof(search) != "object" && typeof(intersection) != "object")) {
        return search === intersection ? [] : [search];
    }

    if (typeof(search) != "object") {
        return intersection.includes(search) ? [] : [search];
    }
    if (typeof(intersection) != "object") {
        return search.filter(e => e != intersection);
    }
    return search.filter(e => !intersection.includes(e));
}

/**
 * 
 * @param {Array<string>} arr 
 * @returns 
 */
function arrayToLowerCase(arr) {
    return arr.map(e => e.toLowerCase());
}

/**
 * 
 * @param {string|number} str 
 * @returns {number?} integer representation of `str`. null if invalid
 */
function toNum(str) {
    if (!isNumeric(str)) {
        return null;
    }
    if (typeof(str) === typeof(0)) { 
        return str;
    }
    return parseInt(Number(str), 10);
}

function isNumeric(input){
    var RE = /^-{0,1}\d*\.{0,1}\d+$/;
    return (RE.test(input));
}

/**
 * 
 * @param {import('discord.js').GuildChannel} channel 
 * @returns {string}
 */
function getChannelParentName(channel) {
    if (!channel['parent']) { return ''; }
    if (!channel.parent['name']) { return ''; }
    return channel.parent.name.toLowerCase();
}

function getDate() {
    var date = new Date();
    return `${date.getFullYear()}-${pad(date.getMonth(), 2)}-${pad(date.getDay(), 2)} ${pad(date.getHours(), 2)}:${pad(date.getMinutes(), 2)}`;
}
function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}

/**
 * 
 * @param {string} hex 
 * @returns {boolean} true if the passed string is a valid hex color, false otherwise
 */
function isValidHexColor(hex) {
    return /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i.test(hex);
}


module.exports = { getRandomName, arrayMatch, isEmpty, formatList, removeIntersection, arrayToLowerCase, toNum, isNumeric, getChannelParentName, getDate, isValidHexColor }
