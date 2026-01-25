const mongoose = require('mongoose');
const ReturnSchema = require('../../models/Return').schema;
module.exports = mongoose.model('WardenReturn', ReturnSchema.discriminator('Warden', new mongoose.Schema({hostelReturnReport: String})), 'returns');