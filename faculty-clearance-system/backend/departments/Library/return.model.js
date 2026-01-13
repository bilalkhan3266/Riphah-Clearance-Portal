const mongoose = require('mongoose');
const ReturnSchema = require('../../models/Return').schema;
module.exports = mongoose.model('LibraryReturn', ReturnSchema.discriminator('Library', new mongoose.Schema({bookConditionReport: String})), 'returns');