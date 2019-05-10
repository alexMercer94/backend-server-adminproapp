const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.get('/:tipo/:img', (req, res, next) => {
    const type = req.params.tipo;
    const img = req.params.img;

    const pathImage = path.resolve(__dirname, `../uploads/${type}/${img}`);

    if (fs.existsSync(pathImage)) {
        res.sendFile(pathImage);
    } else {
        const pathNoImage = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImage);
    }
});

module.exports = app;
