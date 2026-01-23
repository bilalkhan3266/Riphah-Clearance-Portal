const mongoose = require('mongoose');
const ReturnSchema = require('../../models/Return').schema;
module.exports = mongoose.model('RecordReturn', ReturnSchema.discriminator('Record', new mongoose.Schema({recordReturnReport: String})), 'returns');