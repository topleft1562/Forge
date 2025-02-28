"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth = (req, res, next) => {
    // const { authorization } = req.headers;
    // const token = authorization?.split(' ')[1];
    const authHeader = req.header('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    if (!token) {
        res.status(400).json({ message: 'Token is required' });
        return;
    }
    try {
        jsonwebtoken_1.default.verify(token, 'secret', (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Failed to authenticate token' });
            }
            req.user = decoded;
            next();
        });
    }
    catch (error) {
        res.status(401).json({ msg: "Token is not valid" });
    }
};
exports.auth = auth;
