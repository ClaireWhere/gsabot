const { createLogger, format, transports } = require('winston')
const { combine } = format;
const { version, name } = require('../package.json');
const fs = require('fs');

function getFormattedDate() {
    const date = new Date();

    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let min = date.getMinutes();
    let sec = date.getSeconds();

    month = `${(month < 10 ? "0" : "")}${month}`;
    day = `${(day < 10 ? "0" : "")}${day}`;
    hour = `${(hour < 10 ? "0" : "")}${hour}`;
    min = `${(min < 10 ? "0" : "")}${min}`;
    sec = `${(sec < 10 ? "0" : "")}${sec}`;

    const str = `${date.getFullYear()}-${month}-${day}_${hour}-${min}-${sec}`;
    return str;
}

const baseDir = `${process.env.LOGS_DIR}/${getFormattedDate()}`
if (!fs.existsSync('baseDir')) {
    fs.mkdirSync(baseDir, { recursive: true});
}
const errorLogFilepath = `${baseDir}/error.log`;
const combinedLogFilepath = `${baseDir}/combined.log`;
const exceptionsLogFilepath = `${baseDir}/exceptions.log`;
const rejectionsLogFilepath = `${baseDir}/rejections.log`;

const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

const logFormat = combine(
    format.label({ label: `${name}@${version}`, message: false }),
    format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
    }),
    format.padLevels(),
    format.errors({ stack: true }),
    format.printf(
        info => {return `${info.timestamp} [${info.label}] [${info.level}]: ${info.message}`}
    )
)

const logger = createLogger({
    level: logLevel,
    format: logFormat,
    defaultMeta: { service: 'user-service' },
    transports: [
        new transports.File({ filename: errorLogFilepath, level: 'error' }),
        new transports.File({ filename: combinedLogFilepath })
    ],
    exceptionHandlers: [
        new transports.File({ filename: exceptionsLogFilepath })
    ],
    rejectionHandlers: [
        new transports.File({ filename: rejectionsLogFilepath })
    ],
    exitOnError: false
});

if (process.env.NODE_ENV !== 'production') {
    const consoleLogFormat = combine(
        format.colorize({
            all: true,
            colors: {
                debug: 'gray',
                info: 'cyan',
                warn: 'yellow',
                error: 'red'
            }
        }),
        format.timestamp({
            format: 'HH:mm:ss.SSS'
        }),
        format.printf(
            info => {return `${info.timestamp} [${info.label}] [${info.level}]: ${info.message}`}
        )
    );
    
    logger.add(new transports.Console({
        format: consoleLogFormat
    }));
}

logger.debug('Logger initialized');

logger.on('error', (error) => {
    console.error('Logger error:', error);
});

module.exports = { logger }
