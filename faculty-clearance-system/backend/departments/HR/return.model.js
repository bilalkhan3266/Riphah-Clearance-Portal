const mongoose = require('mongoose');
const ReturnSchema = require('../../models/Return').schema;
module.exports = mongoose.model('HRReturn', ReturnSchema.discriminator('HR', new mongoose.Schema({documentReturnReport: String})), 'returns');