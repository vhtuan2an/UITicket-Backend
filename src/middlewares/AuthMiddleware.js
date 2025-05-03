const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
const User = require('../models/UserModel')
dotenv.config();

const authMiddleware = (allowedRoles = []) => {
    return async (req, res, next) => {
        let accessToken = req.headers['authorization'];

        if (accessToken && accessToken.startsWith("Bearer ")) {
            accessToken = accessToken.slice(7);
        }

        if (!accessToken) {
            return res.status(401).json({ error: "Please Login First" });
        } else {
            try {
                const deCodeToken = await jwt.verify(
                    accessToken,
                    process.env.ACCESS_TOKEN
                );

                req.role = deCodeToken.role;
                req.id = deCodeToken.id;

                if (allowedRoles.length && !allowedRoles.includes(req.role)) {
                    return res
                        .status(403)
                        .json({ error: "Access denied: Insufficient permissions" });
                }

                next();
            } catch (error) {
                if (
                    error.name === "JsonWebTokenError" ||
                    error.name === "TokenExpiredError"
                ) {
                    return res
                        .status(401)
                        .json({ error: "Invalid or expired token. Please log in again." });
                }
                return res.status(500).json({ error: "Internal server error" });
            }
        }
    };
};

module.exports = {
    authMiddleware,
};