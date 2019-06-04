const express = require('express');
const Medico = require('../models/medico');
const mdAuth = require('../middlewares/auth');
const app = express();

/**
 * Route to get all doctors
 */
app.get('/', (req, res, next) => {
    // Pagination
    let desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('user', 'name email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error al cargar los médicos',
                    errors: err
                });
            }

            Medico.count({}, (err, count) => {
                res.status(200).json({
                    ok: true,
                    medicos,
                    total: count
                });
            });
        });
});

/**
 * Get jus a doctor
 */
app.get('/:id', (req, res) => {
    const id = req.params.id;

    Medico.findById(id)
        .populate('user', 'name email img')
        .populate('hospital')
        .exec((err, medico) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error al buscar médico',
                    errors: err
                });
            }

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    message: 'El médico con el id ' + id + ' no existe',
                    errors: { message: 'No existe un médico con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                medico: medico
            });
        });
});

/**
 * Route to create a new doctor
 */
app.post('/', mdAuth.verifyToken, (req, res) => {
    const body = req.body;

    const medico = new Medico({
        name: body.name,
        user: req.user._id,
        hospital: body.hospital
    });

    medico.save((err, medicoSaved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear médico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoSaved
        });
    });
});

/**
 * Route in order to update a doctor
 */
app.put('/:id', mdAuth.verifyToken, (req, res) => {
    const id = req.params.id;
    const body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar médico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                message: 'El médico con el id ' + id + ' no existe',
                errors: { message: 'No existe un médico con ese ID' }
            });
        }

        medico.name = body.name;
        medico.user = req.user._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoSaved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar médico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoSaved
            });
        });
    });
});

/**
 * Route in order to delete a doctor
 */
app.delete('/:id', mdAuth.verifyToken, (req, res) => {
    const id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoDeleted) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al eliminar médico',
                errors: err
            });
        }

        if (!medicoDeleted) {
            return res.status(400).json({
                ok: false,
                message: 'No existe un médico con ese ID',
                errors: {
                    message: 'No existe un médico con ese ID'
                }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoDeleted
        });
    });
});

module.exports = app;
