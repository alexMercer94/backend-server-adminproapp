const express = require('express');
const app = express();
const fileupload = require('express-fileupload');
const User = require('../models/user');
const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const fs = require('fs');

app.use(fileupload());

app.put('/:tipo/:id', (req, res, next) => {
    const type = req.params.tipo;
    const id = req.params.id;

    // Tipos de coleccion
    const validTypes = ['hospitals', 'medicos', 'users'];
    if (validTypes.indexOf(type) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Tipo de colección no válida',
            errors: {
                message: 'Tipo de colección no válida'
            }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No selecciono un archivo',
            errors: {
                message: 'Debe seleccionar una imagen'
            }
        });
    }

    // Get file's name
    const file = req.files.image;
    const nameSplit = file.name.split('.');
    const extension = nameSplit[nameSplit.length - 1];

    // Verificar si es un extension permitida
    const validExtensions = ['png', 'jpg', 'jpeg', 'gif'];
    if (validExtensions.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Extensión no válida',
            errors: {
                message: 'Las extensiones válidas son: ' + validExtensions.join(', ')
            }
        });
    }

    // Create a personalize name
    const filename = `${id}-${new Date().getMilliseconds()}.${extension}`;

    // Mover el archivo temporal a un path
    const path = `./uploads/${type}/${filename}`;
    file.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Erro al mover archivo',
                errors: err
            });
        }

        uploadByType(type, id, filename, res);
    });
});

function uploadByType(type, id, filename, res) {
    if (type === 'users') {
        User.findById(id, (err, user) => {
            // Verificar si el usuario existe
            if (!user) {
                return res.status(400).json({
                    ok: true,
                    message: 'Usuario no existe',
                    errors: {
                        message: 'Usuario no existe'
                    }
                });
            }

            const oldPath = './uploads/users/' + user.img;

            //Remover la imagen anterio para poner la nueva
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            user.img = filename;
            user.save((err, userUpdated) => {
                userUpdated.password = ':)';

                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de usuario actualizada',
                    user: userUpdated
                });
            });
        });
    }

    if (type === 'medicos') {
        Medico.findById(id, (err, medico) => {
            // Verificar si el usuario existe
            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    message: 'Médico no existe',
                    errors: {
                        message: 'Médico no existe'
                    }
                });
            }

            const oldPath = './uploads/medicos/' + medico.img;

            //Remover la imagen anterio para poner la nueva
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            medico.img = filename;
            medico.save((err, medicoUpdated) => {
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen del médico actualizada',
                    medico: medicoUpdated
                });
            });
        });
    }

    if (type === 'hospitals') {
        Hospital.findById(id, (err, hospital) => {
            // Verificar si el usuario existe
            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    message: 'Hospital no existe',
                    errors: {
                        message: 'Hospital no existe'
                    }
                });
            }

            const oldPath = './uploads/hospitals/' + hospital.img;

            //Remover la imagen anterio para poner la nueva
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            hospital.img = filename;
            hospital.save((err, hospitalUpdated) => {
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de hospital actualizada',
                    hospital: hospitalUpdated
                });
            });
        });
    }
}

module.exports = app;
