const { Schema, model } = require('mongoose');

const HospitalSchema = new Schema({
    name: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String },
    user: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = model('Hospital', HospitalSchema);
