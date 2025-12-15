const mongoose = require('mongoose');
const IssueSchema = require('../../models/Issue').schema;
module.exports = mongoose.model('HRIssue', IssueSchema.discriminator('HR', new mongoose.Schema({documentType: String})), 'issues');