const { Schema, model } = require('mongoose');

const MedicoSchema = new Schema({
    name: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital', required: [true, 'El ID Hospital es requerido'] }
});

module.exports = model('Medico', MedicoSchema);
