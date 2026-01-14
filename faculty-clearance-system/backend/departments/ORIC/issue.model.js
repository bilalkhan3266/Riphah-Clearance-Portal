const mongoose = require('mongoose');
const IssueSchema = require('../../models/Issue').schema;
module.exports = mongoose.model('ORICIssue', IssueSchema.discriminator('ORIC', new mongoose.Schema({researchReferenceCode: String})), 'issues');