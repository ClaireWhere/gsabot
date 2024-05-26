/* eslint-disable capitalized-comments */
/* eslint-disable no-magic-numbers */
const { createCanvas, loadImage } = require('canvas');
const { isEmpty } = require('./utils');
const { logger } = require('./logger');
const textColor = '#DBDEE1'
const timestampColor = '#949BA4'
const backgroundColor = '#313338'

const defaultWidth = 800;

const padding = 50;
const initX = padding/2;
const initY = padding/2;
const avatarRadius = 50;
const lineHeight = 35;
const margins = 25;
const fontSize = 24;

/*
 * Note: The font gg sans is licensed by Discord and is currently closed source, meaning it cannot be used or downloaded without explicit permission from Discord. 
 *   If you somehow have it downloaded, great! the messages will look wonderful. 
 *   Otherwise, use whitney, it looks pretty close. 
 *   If none of those are available, open sans is a good fallback.
 */
const font = 'gg sans, whitney book, open sans';
const titleFont = 'gg sans, whitney, open sans';


/**
 * Calculates the absolute minimum width of the canvas (for if the message text is smaller than the header)
 * @param {string} nickname the message author's nickname
 * @param {Date} date the message creation date
 * @returns {number}
 */
function calcMinWidth(nickname, date) {
    const c = createCanvas(0, 0).getContext('2d');
    c.font = `bold ${fontSize}px ${titleFont}`;
    let minWidth = c.measureText(nickname).width;
    c.font = `${fontSize*0.66}px ${font}`;
    minWidth += c.measureText(`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`).width+initX+avatarRadius*2+margins*1.5+padding;
    return minWidth;
}

/**
 * Calculates the width the canvas should have given the size of the message
 * @param {import('discord.js'.Message)} message 
 * @param {string} nickname the message author's nickname
 * @returns {number}
 */
function calcCanvasWidth(message, nickname) {
    const c = createCanvas(0, 0).getContext('2d')
    c.font = `${fontSize}px ${font}`;
    const messageWidth = c.measureText(message).width;

    

    const minWidth = calcMinWidth(nickname, new Date(message.createdTimestamp));
    const singleLineWidth = initX+avatarRadius*2+padding*2+margins+messageWidth;
    //return singleLineWidth < defaultWidth ? singleLineWidth < minWidth ? minWidth : singleLineWidth : message.content.length < 500 ? defaultWidth : (defaultWidth-(500/3))+message.content.length/3;

    if (singleLineWidth < defaultWidth) {
        if (singleLineWidth < minWidth) {
            return minWidth;
        }
        return singleLineWidth;
    }
    if (message.content.length < 500) {
        return defaultWidth;
    }
    return defaultWidth-500/3 + message.content.length/3;
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} string the text to write to fit to each line
 * @param {number} maxWidth the maximum x-position text should be written on each line
 * @param {number} initWidth the initial x-position (width) of the first line before text has been written
 * @returns {[[string]]} an array (lines) of arrays of words that will each fit within the provided width without going over
 */
function splitWord(ctx, string, maxWidth, initWidth) {
    // If the word will fit on the 'current' line, just return it
    if (initWidth+ctx.measureText(string).width+padding <= maxWidth) {
        return [[string]];
    }
    const lines = [];
    let x;
    for (let i = 0; i < string.length; i++) {
        x = i;
        while (ctx.measureText(string.substring(x, i)).width < maxWidth && i++ < string.length) {
            continue;
        }
        lines.push([string.substring(x, i)]);
    }
    // Push to create newline
    lines.push([]); 
    return lines;
}

/**
 * Takes a string as input and returns an array of strings that will each fit within the provided maxWidth
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} string
 * @param {number} maxWidth the maximum x-position text should be written on each line
 * @returns {[[string]]}
 */
function fit(ctx, string, maxWidth) {
    if (ctx.measureText(string).width <= maxWidth) {
        return [[string]];
    }
    const array = string.split(' ');
    let lines = [];
    let line;
    const len = array.length;
    let width;
    for (let i = 0; i < len; i++) {
        line = [];
        width = 0;
        let word;
        // let toPush = [];
        let splitArray;
        while (width <= maxWidth && len > i) {
            splitArray = splitWord(ctx, array[i], maxWidth, width);
            word = splitArray.pop();
            line.push(word);
            if (splitArray.length > 0) {
                lines.push(line);
                word = splitArray.pop();
                line = [word];
                width = 0;
                lines = lines.concat(splitArray);
            }
            width += ctx.measureText(word).width;
            width = width <= maxWidth ? i++ : i;
        }
        lines.push(line);
        
    }
    // We want to remove the first element if it is [[]] - if not removed the output image message would start with a newline
    if (lines[0].length === 1 && isEmpty(lines[0][0])) { lines.shift(); } 
    return lines;
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} text 
 * @param {number} maxWidth the maximum x-position text should be written on each line
 * @returns {[string] | [[string]]}
 */
function fitText(ctx, text, maxWidth) {
    if (text.split('\n').length > 1) {
        let lines = [];
        text.split('\n').forEach(line => {
            lines = lines.concat(fit(ctx, line, maxWidth));
        })
        return lines;
    }
    return fit(ctx, text, maxWidth);
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {[[string]]} array the lines of words to fill to the canvas
 * @param {number} x the starting x position
 * @param {number} y the starting y/line position
 * @returns {number} the ending y/line position
 */
function fillFromArray(ctx, array, x, y) {
    array.forEach(line => {
        ctx.fillText(line.join(' '), x, y);
        y += lineHeight;
    })
    return y;
}

/**
 * 
 * @param {import('discord.js').Message} message 
 * @param {string} nickname the nickname to use for the author
 * @param {string} authorColor the color of the author's name in the format #FFFFFF
 * @returns {Promise<import('canvas').Canvas>} the resulting canvas with everything provided written to it
 */
async function messageToImage(message, nickname, authorColor) {
    // Initialize Message Content & Canvas Height
    const c = createCanvas(0, 0).getContext('2d');
    c.font = `${fontSize}px ${font}`;
    c.fillStyle = textColor;
    //let messageWidth = c.measureText(message.content).width; 
    
    const canvasWidth = calcCanvasWidth(message, nickname);
    /*
     * If the message width is less than default width, make it whatever is needed to fit on one line. Otherwise, default width unless there are 500 characters or more in the message, then it should be dynamic based on the characters in the message
     *     const canvasWidth = messageWidth+avatarRadius*2+padding*2+margins < defaultWidth ? messageWidth+avatarRadius*2+padding*2+margins : message.content.length < 500 ? defaultWidth : (defaultWidth-(500/3))+message.content.length/3;
     *     message.content.length < 500 ? messageWidth < 800 ? 
     *     messageWidth < 800 ? 
     *   if it's less than 800, just make it whatever is needed. If the content length is greater than 500 characters, make it 800, otherwise make it dynamic
     *     const canvasWidth = message.content.length < 500 ? 800 : 550+(message.content.length)/2;
     */
    const lines = fitText(c, message.content, canvasWidth-avatarRadius*2-margins-padding*2)
    const canvasHeight = lines.length*lineHeight+padding*2+lineHeight*0.15;
    // const canvasWidth = lines.length < 5 ? 800 : 800+lines.length*50;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Draw background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw author name
    ctx.font = `bold ${fontSize}px ${titleFont}`;
    ctx.fillStyle = authorColor;
    ctx.fillText(nickname, initX+avatarRadius*2+margins, initY+margins*1.5);
    const authorWidth = ctx.measureText(nickname).width;
    
    // Draw Timestamp
    ctx.fillStyle = timestampColor;
    ctx.font = `${fontSize*0.66}px ${font}`;
    const creationDate = new Date(message.createdTimestamp)
    ctx.fillText(`${creationDate.toLocaleDateString()} ${creationDate.toLocaleTimeString()}`, authorWidth+initX+avatarRadius*2+margins*1.5, initY+margins*1.5);
    
    // Draw message contents
    ctx.font = `${fontSize}px ${font}`;
    ctx.fillStyle = textColor;
    fillFromArray(ctx, lines, initX+avatarRadius*2+margins, initY+margins*1.5+lineHeight*1.15);

    // Draw author avatar
    ctx.beginPath()
    ctx.arc(initX+avatarRadius, initY+avatarRadius, avatarRadius, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.clip()
    await loadImage(message.author.displayAvatarURL().replace('.webp', '.png'))
        .then((image) => {
            ctx.drawImage(image, initX, initY, avatarRadius*2, avatarRadius*2);
        });
    
    return canvas;
}

/**
 * 
 * @param {import('discord.js').Message} message 
 * @param {string} nickname the nickname to use for the author
 * @param {string} authorColor the color of the author's name in the format #FFFFFF 
 * @returns {Promise<Buffer> | null} a buffer of an image representing the provided message
 */
async function messageToBuffer(message, nickname, authorColor) {
    logger.info(`Creating image for message: ${message.id}`);
    return await messageToImage(message, nickname, authorColor).then(canvas => {
        logger.info(`Successfully created image for message: ${message.id}`);
        const buffer = canvas.toBuffer();
        logger.info(`Successfully created buffer for message: ${message.id}`);
        return buffer;
    }).catch(messageToImageError => {
        logger.error(messageToImageError);
        return null;
    });
}

/**
 * 
 * @param {import('discord.js').Message} message 
 * @param {string} nickname the nickname to use for the author
 * @param {string} authorColor the color of the author's name in the format #FFFFFF
 * @returns {Promise<string>} the url of an image representing the provided message
 */
async function messageToUrl(message, nickname, authorColor) {
    logger.info(`Creating image for message: ${message.id}`);
    return await messageToImage(message, nickname, authorColor).then(canvas => {
        logger.info(`Successfully created image for message: ${message.id}`);
        return canvas.toDataURL();
    }).catch(messageToImageError => {
        logger.error(messageToImageError);
    });
}


module.exports = { messageToBuffer, messageToUrl }