const { createCanvas, loadImage } = require('canvas');
const text_color = '#DBDEE1'
const timestamp_color = '#949BA4'
const background_color = '#313338'

const defaultWidth = 800;

const padding = 50;
const initX = padding/2;
const initY = padding/2;
const avatarRadius = 50;
const lineHeight = 35;
const margins = 25;
const fontSize = 24;

/*
    Note: The font gg sans is licensed by Discord and is currently closed source, meaning it cannot be used without explicit permission from Discord. 
    If you somehow have it downloaded, great! the messages will look wonderful. 
    Otherwise, use whitney, it looks pretty close 
*/
const font = 'gg sans'
const title_font = 'gg sans'

//const font = 'whitney book';
//const title_font = 'whitney';

async function messageToBuffer(message, nickname, authorColor) {
    return await messageToImage(message, nickname, authorColor).then(canvas => {
        return canvas.toBuffer();
    }).catch(err => {
        console.error(err);
        return undefined;
    });
}
async function messageToUrl(message, nickname, authorColor) {
    return await messageToImage(message, nickname, authorColor).then(canvas => {
        return canvas.toDataURL();
    }).catch(err => {
        console.error(err);
    });
}

async function messageToImage(message, nickname, authorColor) {
    // Initialize Message Content & Canvas Height
    const c = createCanvas(0, 0).getContext('2d');
    c.font = `${fontSize}px ${font}`;
    c.fillStyle = text_color;
    //let messageWidth = c.measureText(message.content).width; 
    
    const canvasWidth = calcCanvasWidth(message, nickname);
    // If the message width is less than default width, make it whatever is needed to fit on one line. Otherwise, default width unless there are 500 characters or more in the message, then it should be dynamic based on the characters in the message
    //const canvasWidth = messageWidth+avatarRadius*2+padding*2+margins < defaultWidth ? messageWidth+avatarRadius*2+padding*2+margins : message.content.length < 500 ? defaultWidth : (defaultWidth-(500/3))+message.content.length/3;
    // message.content.length < 500 ? messageWidth < 800 ? 
    // messageWidth < 800 ? 
    // if it's less than 800, just make it whatever is needed. If the content length is greater than 500 characters, make it 800, otherwise make it dynamic
    //const canvasWidth = message.content.length < 500 ? 800 : 550+(message.content.length)/2;
    var lines = fitText(c, message.content, canvasWidth-avatarRadius*2-margins-padding*2)
    const canvasHeight = lines.length*lineHeight+padding*2+lineHeight*0.15;
    //const canvasWidth = lines.length < 5 ? 800 : 800+lines.length*50;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Draw background
    ctx.fillStyle = background_color;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw author name
    ctx.font = `bold ${fontSize}px ${title_font}`;
    ctx.fillStyle = authorColor;
    ctx.fillText(nickname, initX+avatarRadius*2+margins, initY+margins*1.5);
    const authorWidth = ctx.measureText(nickname).width;
    
    // Draw Timestamp
    ctx.fillStyle = timestamp_color;
    ctx.font = `${(fontSize*0.66)}px ${font}`;
    ctx.fillText(`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, (authorWidth+initX+avatarRadius*2+margins*1.5), initY+margins*1.5);
    
    // Draw message contents
    ctx.font = `${fontSize}px ${font}`;
    ctx.fillStyle = text_color;
    fillFromArray(ctx, lines, initX+avatarRadius*2+margins, initY+margins*1.5+lineHeight*1.15);

    // Draw author avatar
    ctx.beginPath()
    ctx.arc(initX+avatarRadius, initY+avatarRadius, avatarRadius, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.clip()
    await loadImage('https://cdn.discordapp.com/avatars/309092766749818880/fba5350e48913cd23d8b277bada2ce14.png')
        .then((image) => {
            ctx.drawImage(image, initX, initY, avatarRadius*2, avatarRadius*2);
        });

    

    return canvas;
}

function fitText(ctx, text, maxWidth) {
    if (text.split('\n').length > 1) {
        var lines = [];
        text.split('\n').forEach(line => {
            lines = lines.concat(fit(ctx, line, maxWidth));
        })
        return lines;
    } else {
        return fit(ctx, text, maxWidth);
    }
}

// takes in a string and returns an array of strings that will fit in the provided width
function fit(ctx, string, maxWidth) {
    if (ctx.measureText(string).width <= maxWidth) {
        return [[string]];
    } else {
        var array = string.split(' ');
        var lines = [];
        var line;
        var len = array.length;
        var width;
        for (let i = 0; i < len; i++) {
            line = [];
            width = 0;
            var word;
            toPush = [];
            while (width <= maxWidth && len > i) {
                split_array = splitWord(ctx, array[i], maxWidth, width);
                word = split_array.pop();
                line.push(word);
                if (split_array.length > 0) {
                    lines.push(line);
                    word = split_array.pop();
                    line = [word];
                    width = 0;
                    lines = lines.concat(split_array);
                }
                width += ctx.measureText(word).width;
                width <= maxWidth ? i++ : i;
            }
            lines.push(line);
            
        }
        if (lines[0].length == 1 && isEmpty(lines[0][0])) { lines.shift(); } // we want to remove the first element if it is [[]] - if not removed the output image message would start with a newline
        return lines;
    }
}

function splitWord(ctx, string, maxWidth, initWidth) {
    // if the word will fit on the 'current' line, just return it
    if (initWidth+ctx.measureText(string).width+padding <= maxWidth) {
        return [[string]];
    }
    let lines = [];
    let x;
    for (let i = 0; i < string.length; i++) {
        x = i;
        while (ctx.measureText(string.substring(x, i)).width < maxWidth && i++ < string.length) {
            
        }
        lines.push([string.substring(x, i)]);
    }
    lines.push([]); // push to create newline
    return lines;
}

function fillLines(ctx, string, maxWidth, x, y) {
    fitText(ctx, string, maxWidth).forEach(line => {
        ctx.fillText(line.join(' '), x, y);
        y += 30;
    })
    return y;
}

function fillFromArray(ctx, array, x, y) {
    array.forEach(line => {
        ctx.fillText(line.join(' '), x, y);
        y += lineHeight;
    })
    return y;
}

function isEmpty(obj) {
    if (obj === undefined) { return true; }
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}
function calcMinWidth(nickname) {
    const c = createCanvas(0, 0).getContext('2d');
    c.font = `bold ${fontSize}px ${title_font}`;
    let minWidth = c.measureText(nickname).width;
    c.font = `${(fontSize*0.66)}px ${font}`;
    minWidth += c.measureText(`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`).width+initX+avatarRadius*2+margins*1.5+padding;
    return minWidth;
}

function calcCanvasWidth(message, nickname) {
    const c = createCanvas(0, 0).getContext('2d')
    c.font = `${fontSize}px ${font}`;
    const messageWidth = c.measureText(message).width;
    const minWidth = calcMinWidth(nickname);
    const singleLineWidth = initX+avatarRadius*2+padding*2+margins+messageWidth;
    //return singleLineWidth < defaultWidth ? singleLineWidth < minWidth ? minWidth : singleLineWidth : message.content.length < 500 ? defaultWidth : (defaultWidth-(500/3))+message.content.length/3;

    if (singleLineWidth < defaultWidth) {
        if (singleLineWidth < minWidth) {
            return minWidth;
        } else {
            return singleLineWidth;
        }
    } else {
        if (message.content.length < 500) {
            return defaultWidth;
        } else {
            return (defaultWidth-(500/3))+message.content.length/3;
        }
    }
}

module.exports = { messageToBuffer, messageToUrl }