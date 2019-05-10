const express = require('express');
const Hospital = require('../models/hospital');
const mdAuth = require('../middlewares/auth');
const app = express();

/**
 * Route to get all hospitals
 */
app.get('/', (req, res, next) => {
    // Pagination
    let desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('user', 'name email')
        .exec((err, hospitals) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error al cargar los hospitales',
                    errors: err
                });
            }

            Hospital.count({}, (err, count) => {
                res.status(200).json({
                    ok: true,
                    hospitals,
                    total: count
                });
            });
        });
});

/**
 * Route to create a new hospital
 */
app.post('/', mdAuth.verifyToken, (req, res) => {
    const body = req.body;

    const hospital = new Hospital({
        name: body.name,
        user: req.user._id
    });

    hospital.save((err, hospitalSaved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear hospotal',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalSaved
        });
    });
});

/**
 * Route in order to update a hostpital
 */
app.put('/:id', mdAuth.verifyToken, (req, res) => {
    const id = req.params.id;
    const body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                message: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un Hospital con ese ID' }
            });
        }

        hospital.name = body.name;
        hospital.user = req.user._id;

        hospital.save((err, hospitalSaved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalSaved
            });
        });
    });
});

/**
 * Route in order to delete a hospital
 */
app.delete('/:id', mdAuth.verifyToken, (req, res) => {
    const id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalDeleted) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al eliminar hospital',
                errors: err
            });
        }

        if (!hospitalDeleted) {
            return res.status(400).json({
                ok: false,
                message: 'No existe un hospital con ese ID',
                errors: {
                    message: 'No existe un hospital con ese ID'
                }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalDeleted
        });
    });
});

module.exports = app;
