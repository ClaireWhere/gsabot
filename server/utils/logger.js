const { createLogger, format, transports } = require('winston')
const { combine } = format;
const { version, name } = require('../package.json');

const errorLogFilepath = '../logs/error.log';
const combinedLogFilepath = '../logs/combined.log';
const exceptionsLogFilepath = '../logs/exceptions.log';
const rejectionsLogFilepath = '../logs/rejections.log';

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
                debug: 'black',
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