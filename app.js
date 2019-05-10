// Requires
const express = require('express');
const bodyParser = require('body-parser');

// Init variables
var app = express();

// BodyParser
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Import routes
const appRoutes = require('./routes/app');
const userRoutes = require('./routes/user');
const medicoRoutes = require('./routes/medico');
const loginRoutes = require('./routes/login');
const hospitalRoutes = require('./routes/hospital');
const searchRoutes = require('./routes/search');
const uploadRoutes = require('./routes/upload');
const imagesRoutes = require('./routes/images');

// Connection to Database
require('./database');

// Routes
app.use('/user', userRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', searchRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagesRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// Listen requests
app.listen(3000, () => {
    console.log('Express server: \x1b[32m%s\x1b[0m', 'online');
});
