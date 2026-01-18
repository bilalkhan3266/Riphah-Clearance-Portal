const mongoose = require('mongoose');
const ReturnSchema = require('../../models/Return').schema;
module.exports = mongoose.model('PharmacyReturn', ReturnSchema.discriminator('Pharmacy', new mongoose.Schema({medicineReturnReport: String})), 'returns');