const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const mdAuth = require('../middlewares/auth');
const app = express();

/**
 * Route to get all users
 */
app.get('/', (req, res, next) => {
    // Pagination
    let desde = req.query.desde || 0;
    desde = Number(desde);

    User.find({}, 'name email img role google')
        .skip(desde)
        .limit(5)
        .exec((err, users) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error al cargar usuarios',
                    errors: err
                });
            }

            // Conteo de los registros
            User.count({}, (err, count) => {
                res.status(200).json({
                    ok: true,
                    users,
                    total: count
                });
            });
        });
});

/**
 * Route to create a new user
 */
app.post('/', (req, res) => {
    const body = req.body;

    const user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    user.save((err, userSaved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            user: userSaved,
            userToken: req.user
        });
    });
});

/**
 * Route in order to update user
 */
app.put('/:id', mdAuth.verifyToken, (req, res) => {
    const id = req.params.id;
    const body = req.body;

    User.findById(id, (err, user) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!user) {
            return res.status(400).json({
                ok: false,
                message: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        user.name = body.name;
        user.email = body.email;
        user.role = body.role;

        user.save((err, userSaved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar usuario',
                    errors: err
                });
            }

            userSaved.password = ':)';

            res.status(200).json({
                ok: true,
                user: userSaved
            });
        });
    });
});

/**
 * Route in order to delete an user
 */
app.delete('/:id', mdAuth.verifyToken, (req, res) => {
    const id = req.params.id;

    User.findByIdAndRemove(id, (err, userDeleted) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al eliminar usuario',
                errors: err
            });
        }

        if (!userDeleted) {
            return res.status(400).json({
                ok: false,
                message: 'No existe un usuario con ese ID',
                errors: {
                    message: 'No existe un usuario con ese ID'
                }
            });
        }

        res.status(200).json({
            ok: true,
            user: userDeleted
        });
    });
});

module.exports = app;
