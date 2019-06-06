const express = require('express');
const app = express();

const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const User = require('../models/user');

/**
 * Route to search in a specific collection or table in db
 */
app.get('/coleccion/:table/:busqueda', (req, res) => {
    const search = req.params.busqueda;
    const regex = new RegExp(search, 'i');
    const collection = req.params.table;
    let promise;

    switch (collection) {
        case 'users':
            promise = searchUsers(search, regex);
            break;
        case 'medicos':
            promise = searchMedicos(search, regex);
            break;
        case 'hospitals':
            promise = searchHospitals(search, regex);
            break;
        default:
            res.status(400).json({
                ok: false,
                message: 'El parametro de búsqueda son solo: users, medicos y hospitals',
                error: { message: 'Tabla/Coleccion no válido' }
            });
            break;
    }

    promise.then(data => {
        res.status(200).json({
            ok: true,
            [collection]: data
        });
    });
});

/**
 * Route in order to search in all tables
 */
app.get('/all/:busqueda', (req, res, next) => {
    const search = req.params.busqueda;
    const regex = new RegExp(search, 'i');

    Promise.all([searchHospitals(search, regex), searchMedicos(search, regex), searchUsers(search, regex)]).then(
        responses => {
            res.status(200).json({
                ok: true,
                hospitals: responses[0],
                medicos: responses[1],
                users: responses[2]
            });
        }
    );
});

/**
 * Search in Hospotals table in database
 * @param {*} search term to search
 * @param {*} regex Regular expression
 */
function searchHospitals(search, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ name: regex })
            .populate('user', 'name email img')
            .exec((err, hospitals) => {
                if (err) {
                    reject('Error al cargar hospitales: ', err);
                } else {
                    resolve(hospitals);
                }
            });
    });
}

/**
 * Search in Medicos table in database
 * @param {*} search term to search
 * @param {*} regex Regular expression
 */
function searchMedicos(search, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ name: regex })
            .populate('user', 'name email img')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar médicos: ', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

/**
 * Search in Users table in database
 * @param {*} search term to search
 * @param {*} regex Regular expression
 */
function searchUsers(search, regex) {
    return new Promise((resolve, reject) => {
        User.find({}, 'name email img role')
            .or([{ name: regex }, { email: regex }])
            .exec((err, users) => {
                if (err) {
                    reject('Error al cargar usuarios: ', err);
                } else {
                    resolve(users);
                }
            });
    });
}

module.exports = app;
