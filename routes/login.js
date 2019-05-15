const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user');
const { SEED } = require('../config/config');
const { CLIENT_ID } = require('../config/config');
const client = new OAuth2Client(CLIENT_ID);

const app = express();

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}

/**
 * Route of Google Authentication
 */
app.post('/google', async (req, res) => {
    const token = req.body.token;

    const googleUser = await verify(token).catch(err => {
        res.status(403).json({
            ok: false,
            message: 'Token no válido'
        });
    });

    // Vrificar si el correo del usuario viene googleUser
    User.findOne({ email: googleUser.email }, (err, userDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }

        if (userDB) {
            // Verificar si el usuario fue autenticado por google
            if (userDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    message: 'Debe usar su autenticación normal'
                });
            } else {
                const token = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 }); // Duración de 4 horas

                res.status(200).json({
                    ok: true,
                    user: userDB,
                    token: token,
                    id: userDB._id
                });
            }
        } else {
            // El usuario no existe; hay que crearlo
            const user = new User();
            user.name = googleUser.name;
            user.email = googleUser.email;
            user.img = googleUser.img;
            user.google = true;
            user.password = ':)';

            user.save((err, userDB) => {
                const token = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 }); // Duración de 4 horas

                res.status(200).json({
                    ok: true,
                    user: userDB,
                    token: token,
                    id: userDB._id
                });
            });
        }
    });

    // res.status(200).json({
    //     ok: true,
    //     message: 'OK',
    //     googleUser
    // });
});

/**
 * Route of normal authentication
 */
app.post('/', (req, res) => {
    const body = req.body;

    User.findOne({ email: body.email }, (err, userDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!userDB) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas',
                errors: err
            });
        }

        userDB.password = ':)';
        // Create token
        const token = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 }); // Duración de 4 horas

        res.status(200).json({
            ok: true,
            user: userDB,
            token: token,
            id: userDB._id
        });
    });
});

module.exports = app;
