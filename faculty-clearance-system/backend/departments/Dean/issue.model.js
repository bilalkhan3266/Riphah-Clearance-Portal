const mongoose = require('mongoose');
const IssueSchema = require('../../models/Issue').schema;
module.exports = mongoose.model('DeanIssue', IssueSchema.discriminator('Dean', new mongoose.Schema({deanReferenceCode: String})), 'issues');