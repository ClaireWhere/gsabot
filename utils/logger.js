const { createLogger, format, transports } = require('winston')
const { combine, timestamp, label, printf } = format;
const { version, name } = require('../package.json');

const logFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} ${label} [${level}]: ${message}`;
});

const logger = createLogger({
    level: 'info',
    format: combine(
        label({ label: `[${name}@${version}]` }),
        timestamp(),
        logFormat
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
        new transports.File({ filename: '../logs/error.log', level:'error' }),
        new transports.File({ filename: '../logs/combined.log' })
    ],
    exceptionHandlers: [
        new transports.File({ filename: '../logs/exceptions.log' })
    ],
    rejectionHandlers: [
        new transports.File({ filename: '../logs/rejections.log' })
    ],
    exitOnError: false
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.simple()
    }));
}

module.exports = { logger }