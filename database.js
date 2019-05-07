const mongoose = require('mongoose');

mongoose
    .connect('mongodb://localhost/hospitalDB', {
        useNewUrlParser: true
    })
    .then(db => console.log('Database: \x1b[32m%s\x1b[0m', 'online'))
    .catch(err => console.log(err));
