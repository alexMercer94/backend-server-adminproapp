const jwt = require('jsonwebtoken');
const { SEED } = require('../config/config');

/**
 * Verify token (Middelware)
 */
exports.verifyToken = (req, res, next) => {
    const token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                message: 'Token incorrecto',
                errors: err
            });
        }

        req.user = decoded.user;

        next();
    });
};
