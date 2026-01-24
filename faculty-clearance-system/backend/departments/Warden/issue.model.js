const mongoose = require('mongoose');
const IssueSchema = require('../../models/Issue').schema;
module.exports = mongoose.model('WardenIssue', IssueSchema.discriminator('Warden', new mongoose.Schema({hostelReferenceCode: String})), 'issues');