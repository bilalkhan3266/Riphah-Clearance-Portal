const mongoose = require('mongoose');
const ReturnSchema = require('../../models/Return').schema;
module.exports = mongoose.model('ORICReturn', ReturnSchema.discriminator('ORIC', new mongoose.Schema({researchReturnReport: String})), 'returns');