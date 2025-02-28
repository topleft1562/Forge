"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showErrorLogOnly = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const { createLogger, format, transports } = winston_1.default;
const { combine, printf } = format;
const LOG_LEVEL = "info";
const logFormat = printf(({ level, message, timestamp }) => {
    return `[${level}][${timestamp}][API] ${message}`;
});
exports.logger = createLogger({
    level: LOG_LEVEL,
    format: combine(format.prettyPrint(), format.splat(), format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
    transports: [new transports.Console({})],
});
function showErrorLogOnly() {
    exports.logger.level = "error";
}
exports.showErrorLogOnly = showErrorLogOnly;
