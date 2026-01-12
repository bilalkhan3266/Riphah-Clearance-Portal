const mongoose = require('mongoose');
const IssueSchema = require('../../models/Issue').schema;
module.exports = mongoose.model('LibraryIssue', IssueSchema.discriminator('Library', new mongoose.Schema({libraryLocationCode: String})), 'issues');