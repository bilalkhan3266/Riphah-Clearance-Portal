const mongoose = require('mongoose');
const IssueSchema = require('../../models/Issue').schema;
module.exports = mongoose.model('ITIssue', IssueSchema.discriminator('IT', new mongoose.Schema({assetTag: String})), 'issues');