const mongoose = require('mongoose');
const ReturnSchema = require('../../models/Return').schema;
module.exports = mongoose.model('FinanceReturn', ReturnSchema.discriminator('Finance', new mongoose.Schema({paymentReceiptNumber: String})), 'returns');