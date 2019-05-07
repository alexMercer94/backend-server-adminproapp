// Requires
const express = require('express');
const mongoose = require('mongoose');

// Init variables
var app = express();

// Connection to Database
require('./database');

// Routes
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        message: 'Petición realizada correctamente'
    });
});

// Listen requests
app.listen(3000, () => {
    console.log('Express server: \x1b[32m%s\x1b[0m', 'online');
});
