const mongoose = require('mongoose');
const ReturnSchema = require('../../models/Return').schema;
module.exports = mongoose.model('ITReturn', ReturnSchema.discriminator('IT', new mongoose.Schema({assetReturnReport: String})), 'returns');