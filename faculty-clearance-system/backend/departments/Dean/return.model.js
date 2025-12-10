const mongoose = require('mongoose');
const ReturnSchema = require('../../models/Return').schema;
module.exports = mongoose.model('DeanReturn', ReturnSchema.discriminator('Dean', new mongoose.Schema({deanReturnReport: String})), 'returns');