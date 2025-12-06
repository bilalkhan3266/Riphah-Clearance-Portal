const mongoose = require('mongoose');
const IssueSchema = require('../../models/Issue').schema;
module.exports = mongoose.model('AdminIssue', IssueSchema.discriminator('Admin', new mongoose.Schema({adminReferenceCode: String})), 'issues');