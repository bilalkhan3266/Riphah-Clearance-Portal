const mongoose = require('mongoose');
const IssueSchema = require('../../models/Issue').schema;
module.exports = mongoose.model('FinanceIssue', IssueSchema.discriminator('Finance', new mongoose.Schema({paymentReference: String})), 'issues');