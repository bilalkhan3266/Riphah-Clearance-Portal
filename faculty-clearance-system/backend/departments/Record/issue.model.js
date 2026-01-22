const mongoose = require('mongoose');
const IssueSchema = require('../../models/Issue').schema;
module.exports = mongoose.model('RecordIssue', IssueSchema.discriminator('Record', new mongoose.Schema({recordID: String})), 'issues');