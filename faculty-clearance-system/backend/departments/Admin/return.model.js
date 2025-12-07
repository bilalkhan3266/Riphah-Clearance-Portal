const mongoose = require('mongoose');
const ReturnSchema = require('../../models/Return').schema;
module.exports = mongoose.model('AdminReturn', ReturnSchema.discriminator('Admin', new mongoose.Schema({adminReturnReport: String})), 'returns');