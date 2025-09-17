import winston from "winston";
import path from "path";

const logDir = 'logs';

const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || 'info',
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.errors({stack: true}),
		winston.format.json()
	),
	transports: [
		new winston.transports.File({
			filename: path.join(logDir, 'error.log'),
			level: 'error',
			maxsize: 5232880,
			maxFiles: 5
		}),

		new winston.transports.File({
			filename: path.join(logDir, 'combined.log'),
			maxsize: 5242880,
			maxFiles: 5
		})
	]
});

if(process.env.NODE_ENV !== 'production') {
	logger.add(new winston.transports.Console({
		format: winston.format.combine(
			winston.format.colorize(),
			winston.format.simple()
		)
	})); 
}

export default logger;