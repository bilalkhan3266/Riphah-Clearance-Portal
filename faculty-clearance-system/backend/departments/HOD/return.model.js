const mongoose = require('mongoose');
const ReturnSchema = require('../../models/Return').schema;
module.exports = mongoose.model('HODReturn', ReturnSchema.discriminator('HOD', new mongoose.Schema({hodReturnReport: String})), 'returns');