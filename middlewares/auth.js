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

/**
 * Verify ADMIN ROLE (Middelware)
 */
exports.verifyAdminRole = (req, res, next) => {
    const user = req.user;

    if (user.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            message: 'Token incorrecto',
            errors: {
                message: 'No posee el role para realizar este cambio'
            }
        });
    }
};

/**
 * Verify ADMIN ROLE or the same User (Middelware)
 */
exports.verifyAdminOrSameUser = (req, res, next) => {
    const user = req.user;
    const id = req.params.id;

    if (user.role === 'ADMIN_ROLE' || user._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            message: 'Token incorrecto',
            errors: {
                message: 'No posee el role para realizar este cambio o no es el mismo usuario'
            }
        });
    }
};
