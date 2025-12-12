const mongoose = require('mongoose');
const IssueSchema = require('../../models/Issue').schema;
module.exports = mongoose.model('HODIssue', IssueSchema.discriminator('HOD', new mongoose.Schema({hodReferenceCode: String})), 'issues');