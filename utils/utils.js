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

console.log(isEmpty({})); // returns true
console.log(isEmpty({"property": 1})); // returns false
console.log(isEmpty(undefined)); // returns true
console.log(isEmpty("1")); // returns true

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

module.exports = { arrayMatch, isEmpty, formatList }